"""
Compliance Control Extractor
Extracts compliance controls from PDF documents and URLs
"""
import logging
import io
import re
from typing import List, Dict, Any, Optional
import requests
from pypdf import PdfReader
import pdfplumber
from openai import OpenAI

logger = logging.getLogger(__name__)


class ComplianceExtractor:
    """Extract compliance controls from various sources"""
    
    def __init__(self, openai_api_key: str = None, openai_enabled: bool = False,
                 lm_studio_host: str = "http://localhost:1234",
                 lm_studio_model: str = "google/gemma-2-9b", lm_studio_enabled: bool = True,
                 ollama_host: str = "http://ollama:11434",
                 ollama_model: str = "tinyllama", ollama_enabled: bool = False):
        self.openai_enabled = openai_enabled
        self.client = OpenAI(api_key=openai_api_key) if (openai_enabled and openai_api_key) else None
        self.lm_studio_host = lm_studio_host
        self.lm_studio_model = lm_studio_model
        self.lm_studio_enabled = lm_studio_enabled
        self.lm_studio_available = self._check_lm_studio() if lm_studio_enabled else False
        self.ollama_host = ollama_host
        self.ollama_model = ollama_model
        self.ollama_enabled = ollama_enabled
        self.ollama_available = self._check_ollama() if ollama_enabled else False
        
        # Validate that at least one extraction method is enabled
        if not self.lm_studio_enabled and not self.openai_enabled and not self.ollama_enabled:
            raise ValueError("At least one extraction method must be enabled (LM_STUDIO_ENABLED, OPENAI_ENABLED, or OLLAMA_ENABLED)")
        
        # Log which extraction method will be used
        if self.lm_studio_enabled and self.lm_studio_available:
            logger.info(f"Using LM Studio for extraction ({self.lm_studio_model})")
        elif self.ollama_enabled and self.ollama_available:
            logger.info(f"Using Ollama for extraction ({self.ollama_model})")
        elif self.openai_enabled and self.client:
            logger.info("Using OpenAI for extraction")
        elif self.lm_studio_enabled and not self.lm_studio_available:
            raise ValueError("LM Studio is enabled but not available. Please start LM Studio or disable it.")
        elif self.ollama_enabled and not self.ollama_available:
            raise ValueError("Ollama is enabled but not available. Please start Ollama or disable it.")
        elif self.openai_enabled and not self.client:
            raise ValueError("OpenAI is enabled but API key is not configured")
        self.extraction_prompt = """You are a compliance expert. Extract compliance controls from the provided text.

For each control, provide:
1. control_id: Unique identifier (e.g., "SOC2-CC6.1", "HIPAA-164.308")
2. description: Clear description of the control requirement
3. condition: A boolean condition to check compliance (use format: event.field == value)
4. severity: One of "critical", "high", "medium", "low"
5. remediation: Steps to fix if violated
6. category: Control category (e.g., "Access Control", "Data Protection", "Monitoring")
7. standard: Audit standard name (e.g., "SOC2", "HIPAA", "ISO27001")

Return a JSON object with a "controls" key containing an array of control objects.

Example:
{{"controls": [{{"control_id":"SOC2-CC6.1","description":"S3 buckets must not be publicly accessible","condition":"event.public == False","severity":"critical","remediation":"Update bucket policy to restrict public access","category":"Access Control","standard":"SOC2"}}]}}

Text to analyze:
{text}"""
    
    def _check_lm_studio(self) -> bool:
        """Check if LM Studio is available"""
        try:
            response = requests.get(f"{self.lm_studio_host}/v1/models", timeout=2)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"LM Studio not available at {self.lm_studio_host}: {e}")
            return False
    
    
    def _check_ollama(self) -> bool:
        """Check if Ollama is available"""
        try:
            response = requests.get(f"{self.ollama_host}/api/tags", timeout=2)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama not available at {self.ollama_host}: {e}")
            return False
    
    def _extract_with_ollama(self, text: str) -> List[Dict[str, Any]]:
        """Extract controls using Ollama (local LLM)"""
        import json
        
        try:
            logger.info(f"Using Ollama ({self.ollama_model}) for extraction")
            
            prompt = self.extraction_prompt.format(text=text[:2000])  # Limit text for smaller model
            
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=300  # Increased timeout to 5 minutes for local model
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get("response", "")
                
                # Parse JSON response
                try:
                    parsed = json.loads(content)
                    if isinstance(parsed, dict) and 'controls' in parsed:
                        controls = parsed['controls']
                        logger.info(f"Ollama extracted {len(controls)} controls")
                        return controls
                except json.JSONDecodeError:
                    logger.error("Failed to parse Ollama response as JSON")
            
            return []
            
        except Exception as e:
            logger.error(f"Ollama extraction failed: {e}")
            return []
    
    def _extract_with_lm_studio(self, text: str) -> List[Dict[str, Any]]:
        """Extract controls using LM Studio (local LLM)"""
        import json
        
        try:
            logger.info(f"Using LM Studio ({self.lm_studio_model}) for extraction")
            
            prompt = self.extraction_prompt.format(text=text[:4000])  # Gemma-2-9b can handle more context
            
            # LM Studio uses OpenAI-compatible API
            response = requests.post(
                f"{self.lm_studio_host}/v1/chat/completions",
                json={
                    "model": self.lm_studio_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a compliance expert that extracts controls from audit documents. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"}
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                # Parse JSON response
                try:
                    parsed = json.loads(content)
                    if isinstance(parsed, dict) and 'controls' in parsed:
                        controls = parsed['controls']
                        logger.info(f"LM Studio extracted {len(controls)} controls")
                        return controls
                    elif isinstance(parsed, list):
                        logger.info(f"LM Studio extracted {len(parsed)} controls (direct array)")
                        return parsed
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse LM Studio response as JSON: {e}")
                    logger.debug(f"Response content: {content[:500]}")
            else:
                logger.error(f"LM Studio request failed with status {response.status_code}: {response.text}")
            
            return []
            
        except Exception as e:
            logger.error(f"LM Studio extraction failed: {e}")
            return []
    
    
    def extract_from_pdf_bytes(self, content: bytes) -> List[Dict[str, Any]]:
        """
        Extract controls from PDF bytes
        
        Args:
            content: PDF file content as bytes
            
        Returns:
            List of extracted controls
        """
        try:
            # Try PyPDF2 first
            text = self._extract_text_pypdf2(content)
            
            # If PyPDF2 fails or returns little text, try pdfplumber
            if not text or len(text) < 100:
                text = self._extract_text_pdfplumber(content)
            
            if not text:
                logger.error("Failed to extract text from PDF")
                return []
            
            # Extract controls using AI
            return self._extract_controls_with_ai(text)
            
        except Exception as e:
            logger.error(f"Error extracting from PDF: {e}")
            return []
    
    def extract_from_url(self, url: str) -> List[Dict[str, Any]]:
        """
        Extract controls from PDF URL
        
        Args:
            url: URL to PDF document
            
        Returns:
            List of extracted controls
        """
        try:
            logger.info(f"Downloading PDF from {url}")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            return self.extract_from_pdf_bytes(response.content)
            
        except Exception as e:
            logger.error(f"Error downloading PDF from URL: {e}")
            return []
    
    def _extract_text_pypdf2(self, content: bytes) -> str:
        """Extract text using PyPDF2"""
        try:
            pdf_file = io.BytesIO(content)
            reader = PdfReader(pdf_file)
            
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            return "\n".join(text_parts)
            
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {e}")
            return ""
    
    def _extract_text_pdfplumber(self, content: bytes) -> str:
        """Extract text using pdfplumber (better for complex PDFs)"""
        try:
            pdf_file = io.BytesIO(content)
            text_parts = []
            
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
            
            return "\n".join(text_parts)
            
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}")
            return ""
    
    def _extract_controls_with_ai(self, text: str, chunk_size: int = 8000) -> List[Dict[str, Any]]:
        """
        Extract controls from text using AI
        
        Args:
            text: Extracted text from PDF
            chunk_size: Maximum characters per chunk
            
        Returns:
            List of extracted controls
        """
        import json
        
        try:
            # Split text into chunks if too long
            chunks = self._split_text(text, chunk_size)
            all_controls = []
            
            for i, chunk in enumerate(chunks):
                logger.info(f"Processing chunk {i+1}/{len(chunks)}")
                
                prompt = self.extraction_prompt.format(text=chunk)
                chunk_controls = None
                
                # Use the configured extraction method (no fallbacks)
                if self.lm_studio_enabled and self.lm_studio_available:
                    # Use LM Studio
                    try:
                        logger.info(f"Using LM Studio for chunk {i+1}")
                        chunk_controls = self._extract_with_lm_studio(chunk)
                        if chunk_controls:
                            logger.info(f"LM Studio extracted {len(chunk_controls)} controls from chunk {i+1}")
                        else:
                            logger.error(f"LM Studio returned no controls for chunk {i+1}")
                    except Exception as e:
                        logger.error(f"LM Studio extraction failed for chunk {i+1}: {e}")
                        raise
                
                elif self.ollama_enabled and self.ollama_available:
                    # Use Ollama
                    try:
                        logger.info(f"Using Ollama for chunk {i+1}")
                        chunk_controls = self._extract_with_ollama(chunk)
                        if chunk_controls:
                            logger.info(f"Ollama extracted {len(chunk_controls)} controls from chunk {i+1}")
                        else:
                            logger.error(f"Ollama returned no controls for chunk {i+1}")
                    except Exception as e:
                        logger.error(f"Ollama extraction failed for chunk {i+1}: {e}")
                        raise
                
                elif self.openai_enabled and self.client:
                    # Use OpenAI
                    try:
                        logger.info(f"Using OpenAI for chunk {i+1}")
                        response = self.client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[
                                {
                                    "role": "system",
                                    "content": "You are a compliance expert that extracts controls from audit documents. Always respond with valid JSON arrays only."
                                },
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ],
                            temperature=0,
                            response_format={"type": "json_object"}
                        )
                        
                        content = response.choices[0].message.content
                        if not content:
                            logger.error(f"Empty response from OpenAI for chunk {i+1}")
                            continue
                        
                        content = content.strip()
                        logger.debug(f"AI Response length: {len(content)} chars")
                        logger.debug(f"AI Response preview: {content[:200]}...")
                        
                        # Parse JSON response with improved strategies for OpenAI v2.x
                        controls = None
                        
                        # Strategy 1: Parse as JSON object (expected format with response_format)
                        try:
                            parsed = json.loads(content)
                            if isinstance(parsed, dict):
                                # Check for controls key (our expected format)
                                if 'controls' in parsed and isinstance(parsed['controls'], list):
                                    controls = parsed['controls']
                                    logger.debug(f"Strategy 1 success: Found {len(controls)} controls in 'controls' key")
                                # Check for other common keys
                                elif any(key in parsed for key in ['items', 'data', 'results']):
                                    for key in ['items', 'data', 'results']:
                                        if key in parsed and isinstance(parsed[key], list):
                                            controls = parsed[key]
                                            logger.debug(f"Strategy 1 success: Found {len(controls)} controls in '{key}' key")
                                            break
                            elif isinstance(parsed, list):
                                # Direct array response (shouldn't happen with json_object mode)
                                controls = parsed
                                logger.debug(f"Strategy 1 success: Direct array with {len(controls)} controls")
                        except json.JSONDecodeError as e:
                            logger.debug(f"Strategy 1 failed: {e}")
                        
                        # Strategy 2: Clean markdown and retry
                        if not controls:
                            try:
                                # Remove markdown code blocks
                                cleaned = re.sub(r'```json\s*|\s*```', '', content)
                                cleaned = cleaned.strip()
                                parsed = json.loads(cleaned)
                                if isinstance(parsed, dict) and 'controls' in parsed:
                                    controls = parsed['controls']
                                    logger.debug(f"Strategy 2 success: Found {len(controls)} controls after cleaning")
                                elif isinstance(parsed, list):
                                    controls = parsed
                                    logger.debug(f"Strategy 2 success: Direct array with {len(controls)} controls")
                            except json.JSONDecodeError as e:
                                logger.debug(f"Strategy 2 failed: {e}")
                        
                        # Strategy 3: Extract JSON object with regex
                        if not controls:
                            try:
                                # Find JSON object
                                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                                if json_match:
                                    parsed = json.loads(json_match.group())
                                    if isinstance(parsed, dict) and 'controls' in parsed:
                                        controls = parsed['controls']
                                        logger.debug(f"Strategy 3 success: Found {len(controls)} controls via regex")
                            except (json.JSONDecodeError, AttributeError) as e:
                                logger.debug(f"Strategy 3 failed: {e}")
                        
                        # Strategy 4: Try to extract array directly
                        if not controls:
                            try:
                                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                                if json_match:
                                    controls = json.loads(json_match.group())
                                    logger.debug(f"Strategy 4 success: Found {len(controls)} controls via array regex")
                            except (json.JSONDecodeError, AttributeError) as e:
                                logger.debug(f"Strategy 4 failed: {e}")
                        
                        if controls and isinstance(controls, list):
                            chunk_controls = controls
                            logger.info(f"OpenAI extracted {len(controls)} controls from chunk {i+1}")
                        else:
                            logger.error(f"All JSON parsing strategies failed for chunk {i+1}")
                            logger.error(f"Raw content (first 1000 chars): {content[:1000]}")
                    except Exception as e:
                        logger.error(f"OpenAI extraction failed for chunk {i+1}: {e}")
                        raise
                
                else:
                    raise ValueError("No extraction method is configured and available")
                
                # Add controls to results
                if chunk_controls and isinstance(chunk_controls, list):
                    all_controls.extend(chunk_controls)
                else:
                    logger.error(f"No controls extracted from chunk {i+1}")
            
            # Validate we got controls
            if not all_controls:
                raise ValueError("No controls extracted from any chunks. Check your extraction service configuration and PDF content.")
            
            # Deduplicate controls by control_id
            unique_controls = {}
            for control in all_controls:
                control_id = control.get('control_id')
                if control_id and control_id not in unique_controls:
                    unique_controls[control_id] = control
            
            result = list(unique_controls.values())
            logger.info(f"Successfully extracted {len(result)} unique controls from PDF")
            return result
            
        except Exception as e:
            logger.error(f"AI extraction failed: {e}")
            # Do not use mock fallback - raise the error
            raise RuntimeError(f"Failed to extract controls from PDF: {e}") from e
    
    
    def _split_text(self, text: str, chunk_size: int) -> List[str]:
        """Split text into chunks"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        # Split by paragraphs
        paragraphs = text.split('\n\n')
        
        for para in paragraphs:
            para_size = len(para)
            
            if current_size + para_size > chunk_size and current_chunk:
                chunks.append('\n\n'.join(current_chunk))
                current_chunk = [para]
                current_size = para_size
            else:
                current_chunk.append(para)
                current_size += para_size
        
        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))
        
        return chunks


# Legacy function for backward compatibility
def extract_controls_from_pdf(content: bytes, openai_api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Extract controls from PDF content
    
    Args:
        content: PDF file content as bytes
        openai_api_key: OpenAI API key (optional, will use env var if not provided)
        
    Returns:
        List of extracted controls
    """
    import os
    api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        logger.error("OpenAI API key not provided")
        return []
    
    extractor = ComplianceExtractor(api_key)
    return extractor.extract_from_pdf_bytes(content)

# Made with Bob
