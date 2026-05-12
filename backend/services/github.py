"""
GitHub Integration Service
Handles auto-remediation via GitHub Pull Requests
"""
import logging
from typing import Dict, Any, Optional
import os

logger = logging.getLogger(__name__)


class GitHubRemediationService:
    """Service for creating remediation PRs on GitHub"""
    
    def __init__(
        self,
        token: Optional[str] = None,
        repo_owner: Optional[str] = None,
        repo_name: Optional[str] = None
    ):
        self.token = token
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.github = None
        
        if token and repo_owner and repo_name:
            try:
                from github import Github
                self.github = Github(token)
                self.repo = self.github.get_repo(f"{repo_owner}/{repo_name}")
                logger.info(f"GitHub integration initialized for {repo_owner}/{repo_name}")
            except ImportError:
                logger.warning("PyGithub not installed, GitHub integration disabled")
            except Exception as e:
                logger.error(f"Failed to initialize GitHub integration: {e}")
    
    def create_remediation_pr(
        self,
        violation: Dict[str, Any],
        event: Dict[str, Any],
        remediation_code: str
    ) -> Optional[str]:
        """
        Create a pull request with remediation code
        
        Args:
            violation: Violated control
            event: Event that triggered violation
            remediation_code: Code/config to fix the issue
            
        Returns:
            PR URL if successful, None otherwise
        """
        if not self.github:
            logger.warning("GitHub integration not configured")
            return None
        
        try:
            control_id = violation.get('control_id', 'unknown')
            branch_name = f"fix/{control_id.lower().replace('.', '-')}"
            
            # Get default branch
            default_branch = self.repo.default_branch
            base_ref = self.repo.get_git_ref(f"heads/{default_branch}")
            
            # Create new branch
            try:
                self.repo.create_git_ref(
                    ref=f"refs/heads/{branch_name}",
                    sha=base_ref.object.sha
                )
            except Exception as e:
                logger.warning(f"Branch {branch_name} may already exist: {e}")
            
            # Determine file path based on resource type
            file_path = self._determine_file_path(event, violation)
            
            # Create or update file
            try:
                # Try to get existing file
                contents = self.repo.get_contents(file_path, ref=branch_name)
                self.repo.update_file(
                    path=file_path,
                    message=f"Fix: {violation.get('description', 'Compliance violation')}",
                    content=remediation_code,
                    sha=contents.sha,
                    branch=branch_name
                )
            except:
                # File doesn't exist, create it
                self.repo.create_file(
                    path=file_path,
                    message=f"Fix: {violation.get('description', 'Compliance violation')}",
                    content=remediation_code,
                    branch=branch_name
                )
            
            # Create pull request
            pr_title = f"🔒 Fix {control_id}: {violation.get('description', 'Compliance violation')[:50]}"
            pr_body = self._create_pr_body(violation, event)
            
            pr = self.repo.create_pull(
                title=pr_title,
                body=pr_body,
                head=branch_name,
                base=default_branch
            )
            
            # Add labels
            try:
                pr.add_to_labels("compliance", "security", f"severity-{violation.get('severity', 'medium')}")
            except:
                pass
            
            logger.info(f"Created PR: {pr.html_url}")
            return pr.html_url
            
        except Exception as e:
            logger.error(f"Error creating remediation PR: {e}")
            return None
    
    def _determine_file_path(self, event: Dict[str, Any], violation: Dict[str, Any]) -> str:
        """Determine appropriate file path for remediation"""
        resource_type = event.get('resource_type', 'unknown')
        
        # Map resource types to file paths
        path_map = {
            's3_bucket': 'terraform/s3.tf',
            'rds_instance': 'terraform/rds.tf',
            'security_group': 'terraform/security_groups.tf',
            'iam_policy': 'terraform/iam.tf',
            'cos_bucket': 'terraform/cos.tf',
        }
        
        return path_map.get(resource_type, f'terraform/{resource_type}.tf')
    
    def _create_pr_body(self, violation: Dict[str, Any], event: Dict[str, Any]) -> str:
        """Create PR description"""
        return f"""## 🔒 Compliance Violation Fix

**Control ID:** {violation.get('control_id', 'Unknown')}  
**Standard:** {violation.get('standard', 'Unknown')}  
**Severity:** {violation.get('severity', 'Unknown').upper()}  
**Category:** {violation.get('category', 'Unknown')}

### Description
{violation.get('description', 'No description available')}

### Event Details
- **Source:** {event.get('source', 'Unknown')}
- **Event:** {event.get('event_name', 'Unknown')}
- **Time:** {event.get('event_time', 'Unknown')}
- **Resource:** {event.get('resource_type', 'Unknown')}

### Remediation
{violation.get('remediation', 'See code changes for remediation steps')}

### Verification Steps
1. Review the proposed changes
2. Test in a non-production environment
3. Verify compliance after deployment
4. Update audit documentation

---
*This PR was automatically generated by AegisAI Continuous Compliance Guardian*
"""


def generate_fix(control: Dict[str, Any], openai_api_key: Optional[str] = None) -> str:
    """
    Generate remediation code using AI
    
    Args:
        control: Violated control
        openai_api_key: OpenAI API key
        
    Returns:
        Generated fix code
    """
    try:
        from openai import OpenAI
        
        api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not api_key:
            return _generate_template_fix(control)
        
        client = OpenAI(api_key=api_key)
        
        prompt = f"""Generate Terraform code to fix this compliance violation:

Control: {control.get('control_id')}
Description: {control.get('description')}
Standard: {control.get('standard')}
Remediation: {control.get('remediation')}

Generate ONLY the Terraform code needed to fix this issue. Include:
1. Resource configuration
2. Security settings
3. Compliance-related attributes
4. Comments explaining the fix

Keep it concise and production-ready."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Error generating fix with AI: {e}")
        return _generate_template_fix(control)


def _generate_template_fix(control: Dict[str, Any]) -> str:
    """Generate template fix code"""
    control_id = control.get('control_id', 'unknown')
    description = control.get('description', 'No description')
    
    return f"""# Fix for {control_id}
# {description}

# TODO: Implement the following remediation steps:
# {control.get('remediation', 'No remediation steps available')}

# Example configuration (update as needed):
resource "aws_s3_bucket" "example" {{
  bucket = "example-bucket"
  
  # Enable encryption
  server_side_encryption_configuration {{
    rule {{
      apply_server_side_encryption_by_default {{
        sse_algorithm = "AES256"
      }}
    }}
  }}
  
  # Block public access
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}}
"""


# Global service instance
_github_service: Optional[GitHubRemediationService] = None


def get_github_service(
    token: Optional[str] = None,
    repo_owner: Optional[str] = None,
    repo_name: Optional[str] = None
) -> GitHubRemediationService:
    """Get or create global GitHub service instance"""
    global _github_service
    
    if _github_service is None:
        _github_service = GitHubRemediationService(
            token=token or os.getenv('GITHUB_TOKEN'),
            repo_owner=repo_owner or os.getenv('GITHUB_REPO_OWNER'),
            repo_name=repo_name or os.getenv('GITHUB_REPO_NAME')
        )
    
    return _github_service

# Made with Bob
