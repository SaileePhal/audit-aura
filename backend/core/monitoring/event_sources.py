"""
Event Source Integrations
Handles ingestion from CloudWatch, IBM Cloud, and other sources
"""
import logging
import json
from typing import Dict, Any, List, Optional, AsyncIterator
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)


class EventSource:
    """Base class for event sources"""
    
    async def get_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Get events from source"""
        raise NotImplementedError


class CloudWatchEventSource(EventSource):
    """AWS CloudWatch event source"""
    
    def __init__(self, region: str = 'us-east-1', mock_mode: bool = True):
        self.region = region
        self.mock_mode = mock_mode
        
        if not mock_mode:
            try:
                import boto3
                self.client = boto3.client('logs', region_name=region)
                self.cloudtrail = boto3.client('cloudtrail', region_name=region)
            except ImportError:
                logger.warning("boto3 not installed, falling back to mock mode")
                self.mock_mode = True
    
    async def get_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Get CloudWatch/CloudTrail events"""
        if self.mock_mode:
            async for event in self._get_mock_events():
                yield event
        else:
            async for event in self._get_real_events():
                yield event
    
    async def _get_real_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Get real CloudWatch events"""
        try:
            # Get CloudTrail events
            response = self.cloudtrail.lookup_events(MaxResults=50)
            
            for event in response.get('Events', []):
                yield {
                    'source': 'cloudwatch',
                    'event_name': event.get('EventName'),
                    'event_time': event.get('EventTime').isoformat(),
                    'username': event.get('Username'),
                    'resource_type': event.get('ResourceType'),
                    'resource_name': event.get('ResourceName'),
                    'cloud_trail_event': json.loads(event.get('CloudTrailEvent', '{}')),
                    'raw': event
                }
                
        except Exception as e:
            logger.error(f"Error fetching CloudWatch events: {e}")
    
    async def _get_mock_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Generate mock CloudWatch events"""
        import random
        
        event_types = [
            {
                'event_name': 'PutBucketPolicy',
                'resource_type': 's3_bucket',
                'public': random.choice([True, False]),
                'encryption_enabled': random.choice([True, False]),
                'versioning_enabled': random.choice([True, False]),
            },
            {
                'event_name': 'ModifyDBInstance',
                'resource_type': 'rds_instance',
                'public': random.choice([True, False]),
                'backup_enabled': random.choice([True, False]),
                'multi_az': random.choice([True, False]),
            },
            {
                'event_name': 'AuthorizeSecurityGroupIngress',
                'resource_type': 'security_group',
                'allows_all_traffic': random.choice([True, False]),
                'port': random.choice([22, 80, 443, 3389, 3306]),
            }
        ]
        
        while True:
            event_template = random.choice(event_types)
            yield {
                'source': 'cloudwatch',
                'event_time': datetime.utcnow().isoformat(),
                'username': 'mock-user',
                **event_template
            }
            await asyncio.sleep(5)


class IBMCloudEventSource(EventSource):
    """IBM Cloud event source for Activity Tracker, Monitoring, and Logs"""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        region: str = 'us-south',
        activity_tracker_instance_id: Optional[str] = None,
        monitoring_instance_id: Optional[str] = None,
        logs_instance_id: Optional[str] = None,
        mock_mode: bool = True
    ):
        self.api_key = api_key
        self.region = region
        self.activity_tracker_instance_id = activity_tracker_instance_id
        self.monitoring_instance_id = monitoring_instance_id
        self.logs_instance_id = logs_instance_id
        self.mock_mode = mock_mode
        self.client = None
        
        if not mock_mode and api_key:
            try:
                import requests
                from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
                
                # Initialize IAM authenticator
                self.authenticator = IAMAuthenticator(api_key)
                
                # Get IAM token
                self.token = self._get_iam_token()
                
                if self.token:
                    logger.info(f"IBM Cloud authenticated successfully for region {region}")
                else:
                    logger.warning("Failed to get IBM Cloud IAM token, falling back to mock mode")
                    self.mock_mode = True
                    
            except ImportError:
                logger.warning("IBM Cloud SDK not installed, falling back to mock mode")
                self.mock_mode = True
            except Exception as e:
                logger.error(f"IBM Cloud authentication failed: {e}, falling back to mock mode")
                self.mock_mode = True
    
    def _get_iam_token(self) -> Optional[str]:
        """Get IBM Cloud IAM token"""
        try:
            import requests
            
            response = requests.post(
                'https://iam.cloud.ibm.com/identity/token',
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                data={
                    'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
                    'apikey': self.api_key
                },
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                logger.error(f"Failed to get IAM token: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting IAM token: {e}")
            return None
    
    async def get_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Get IBM Cloud events"""
        if self.mock_mode:
            async for event in self._get_mock_events():
                yield event
        else:
            async for event in self._get_real_events():
                yield event
    
    async def _get_real_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Get real IBM Cloud Activity Tracker events"""
        import requests
        
        try:
            if not self.token:
                logger.error("No IAM token available")
                return
            
            # Activity Tracker API endpoint
            base_url = f"https://api.{self.region}.logging.cloud.ibm.com"
            
            # Poll for events every 10 seconds
            while True:
                try:
                    # Fetch Activity Tracker events
                    if self.activity_tracker_instance_id:
                        events = await self._fetch_activity_tracker_events(base_url)
                        for event in events:
                            yield event
                    
                    # Fetch Monitoring events
                    if self.monitoring_instance_id:
                        events = await self._fetch_monitoring_events()
                        for event in events:
                            yield event
                    
                    # Fetch Log events
                    if self.logs_instance_id:
                        events = await self._fetch_log_events()
                        for event in events:
                            yield event
                    
                    await asyncio.sleep(10)
                    
                except Exception as e:
                    logger.error(f"Error in event polling loop: {e}")
                    await asyncio.sleep(10)
                    
        except Exception as e:
            logger.error(f"Error fetching IBM Cloud events: {e}")
    
    async def _fetch_activity_tracker_events(self, base_url: str) -> List[Dict[str, Any]]:
        """Fetch events from IBM Cloud Activity Tracker"""
        import requests
        from datetime import datetime, timedelta
        
        try:
            # Query events from last 1 minute
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=1)
            
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            
            # Activity Tracker query
            query_url = f"{base_url}/v1/events"
            params = {
                'from': int(start_time.timestamp() * 1000),
                'to': int(end_time.timestamp() * 1000),
                'size': 100
            }
            
            response = requests.get(query_url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                events = data.get('events', [])
                
                # Transform events to our format
                transformed_events = []
                for event in events:
                    transformed_event = {
                        'source': 'ibm_cloud_activity_tracker',
                        'source_instance': f'ibm-at-{self.region}',
                        'event_time': event.get('eventTime', datetime.utcnow().isoformat()),
                        'event_name': event.get('action', 'unknown'),
                        'action': event.get('action', 'unknown'),
                        'outcome': event.get('outcome', 'unknown'),
                        'initiator': event.get('initiator', {}),
                        'target': event.get('target', {}),
                        'resource_type': event.get('target', {}).get('typeURI', 'unknown'),
                        'resource_name': event.get('target', {}).get('name', 'unknown'),
                        'severity': self._determine_severity(event),
                        'raw': event
                    }
                    transformed_events.append(transformed_event)
                
                return transformed_events
            else:
                logger.warning(f"Activity Tracker API returned {response.status_code}: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching Activity Tracker events: {e}")
            return []
    
    async def _fetch_monitoring_events(self) -> List[Dict[str, Any]]:
        """Fetch events from IBM Cloud Monitoring"""
        # Placeholder for IBM Cloud Monitoring integration
        # This would query metrics and alerts from IBM Cloud Monitoring
        return []
    
    async def _fetch_log_events(self) -> List[Dict[str, Any]]:
        """Fetch events from IBM Cloud Logs"""
        # Placeholder for IBM Cloud Logs integration
        # This would query logs from IBM Cloud Logs service
        return []
    
    def _determine_severity(self, event: Dict[str, Any]) -> str:
        """Determine event severity based on action and outcome"""
        action = event.get('action', '').lower()
        outcome = event.get('outcome', '').lower()
        
        # Failed actions are high severity
        if outcome == 'failure':
            return 'high'
        
        # Security-related actions
        if any(keyword in action for keyword in ['delete', 'update', 'modify', 'create']):
            target_type = event.get('target', {}).get('typeURI', '').lower()
            
            # Critical resources
            if any(resource in target_type for resource in ['iam', 'security', 'key', 'policy']):
                return 'critical'
            
            # High priority resources
            if any(resource in target_type for resource in ['bucket', 'database', 'network']):
                return 'high'
            
            return 'medium'
        
        return 'low'
    
    async def _get_mock_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Generate mock IBM Cloud Activity Tracker events for config changes"""
        import random
        
        # IBM Cloud Activity Tracker event types for configuration changes
        event_types = [
            {
                'event_name': 'cos.bucket.update',
                'resource_type': 'cos_bucket',
                'resource_name': f'prod-bucket-{random.randint(1, 5)}',
                'action': 'update',
                'outcome': 'success',
                'config_change': {
                    'property': 'public_access',
                    'old_value': False,
                    'new_value': random.choice([True, False])
                },
                'public': random.choice([True, False]),
                'encryption': random.choice(['none', 'sse-s3', 'sse-kms']),
                'severity': random.choice(['high', 'medium', 'low'])
            },
            {
                'event_name': 'iam.policy.update',
                'resource_type': 'iam_policy',
                'resource_name': f'policy-{random.randint(1, 10)}',
                'action': 'update',
                'outcome': 'success',
                'config_change': {
                    'property': 'permissions',
                    'old_value': 'read',
                    'new_value': random.choice(['read', 'write', 'admin'])
                },
                'allows_public_access': random.choice([True, False]),
                'severity': random.choice(['critical', 'high', 'medium'])
            },
            {
                'event_name': 'kms.key.update',
                'resource_type': 'kms_key',
                'resource_name': f'encryption-key-{random.randint(1, 3)}',
                'action': 'rotate',
                'outcome': 'success',
                'config_change': {
                    'property': 'rotation_policy',
                    'old_value': '90 days',
                    'new_value': '30 days'
                },
                'key_state': random.choice(['active', 'suspended']),
                'severity': 'medium'
            },
            {
                'event_name': 'vpc.security-group.update',
                'resource_type': 'security_group',
                'resource_name': f'sg-{random.randint(100, 999)}',
                'action': 'update',
                'outcome': 'success',
                'config_change': {
                    'property': 'inbound_rules',
                    'old_value': 'restricted',
                    'new_value': random.choice(['restricted', 'open'])
                },
                'allows_all_traffic': random.choice([True, False]),
                'port': random.choice([22, 80, 443, 3389]),
                'severity': random.choice(['critical', 'high'])
            },
            {
                'event_name': 'databases.instance.update',
                'resource_type': 'database_instance',
                'resource_name': f'db-{random.randint(1, 5)}',
                'action': 'update',
                'outcome': 'success',
                'config_change': {
                    'property': 'backup_enabled',
                    'old_value': True,
                    'new_value': random.choice([True, False])
                },
                'backup_enabled': random.choice([True, False]),
                'encryption_enabled': random.choice([True, False]),
                'severity': random.choice(['high', 'medium'])
            }
        ]
        
        while True:
            event_template = random.choice(event_types)
            yield {
                'source': 'ibm_cloud_activity_tracker',
                'source_instance': f'ibm-at-{random.choice(["us-south", "eu-de", "jp-tok"])}',
                'event_time': datetime.utcnow().isoformat(),
                'username': f'user-{random.randint(1, 5)}@company.com',
                'initiator': {
                    'id': f'IBMid-{random.randint(100000, 999999)}',
                    'name': f'user-{random.randint(1, 5)}@company.com',
                    'type': 'user'
                },
                'target': {
                    'id': event_template['resource_name'],
                    'type': event_template['resource_type'],
                    'name': event_template['resource_name']
                },
                **event_template
            }
            await asyncio.sleep(7)


class GenericLogEventSource(EventSource):
    """Generic log file event source"""
    
    def __init__(self, log_path: Optional[str] = None, mock_mode: bool = True):
        self.log_path = log_path
        self.mock_mode = mock_mode
    
    async def get_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Get events from log files"""
        if self.mock_mode:
            async for event in self._get_mock_events():
                yield event
        else:
            async for event in self._get_real_events():
                yield event
    
    async def _get_real_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Read events from log file"""
        try:
            if not self.log_path:
                return
            
            with open(self.log_path, 'r') as f:
                for line in f:
                    try:
                        event = json.loads(line)
                        yield event
                    except json.JSONDecodeError:
                        continue
                        
        except Exception as e:
            logger.error(f"Error reading log file: {e}")
    
    async def _get_mock_events(self) -> AsyncIterator[Dict[str, Any]]:
        """Generate mock log events"""
        import random
        
        while True:
            yield {
                'source': 'generic_log',
                'event_time': datetime.utcnow().isoformat(),
                'level': random.choice(['INFO', 'WARNING', 'ERROR']),
                'message': 'Configuration change detected',
                'resource_type': random.choice(['database', 'api', 'storage']),
                'public': random.choice([True, False]),
            }
            await asyncio.sleep(10)


class EventAggregator:
    """Aggregates events from multiple sources"""
    
    def __init__(self, sources: List[EventSource]):
        self.sources = sources
        self.running = False
    
    async def start(self) -> AsyncIterator[Dict[str, Any]]:
        """Start aggregating events from all sources"""
        self.running = True
        
        # Use a queue to collect events from all sources
        queue = asyncio.Queue()
        
        async def collect_events(source: EventSource):
            async for event in source.get_events():
                if not self.running:
                    break
                await queue.put(event)
        
        # Start collection tasks
        collection_tasks = [
            asyncio.create_task(collect_events(source))
            for source in self.sources
        ]
        
        # Yield events from queue
        try:
            while self.running:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=1.0)
                    yield event
                except asyncio.TimeoutError:
                    continue
        finally:
            # Cleanup
            for task in collection_tasks:
                task.cancel()
    
    async def _process_source(self, source: EventSource, queue: asyncio.Queue):
        """Process events from a single source and put them in queue"""
        try:
            async for event in source.get_events():
                if not self.running:
                    break
                await queue.put(event)
        except Exception as e:
            logger.error(f"Error processing source: {e}")
    
    def stop(self):
        """Stop aggregating events"""
        self.running = False


def create_event_aggregator(
    mock_mode: bool = True,
    ibm_cloud_api_key: Optional[str] = None,
    ibm_cloud_region: str = 'us-south',
    ibm_activity_tracker_instance_id: Optional[str] = None,
    ibm_monitoring_instance_id: Optional[str] = None,
    ibm_logs_instance_id: Optional[str] = None
) -> EventAggregator:
    """Create an event aggregator with all configured sources"""
    sources = [
        CloudWatchEventSource(mock_mode=mock_mode),
        IBMCloudEventSource(
            api_key=ibm_cloud_api_key,
            region=ibm_cloud_region,
            activity_tracker_instance_id=ibm_activity_tracker_instance_id,
            monitoring_instance_id=ibm_monitoring_instance_id,
            logs_instance_id=ibm_logs_instance_id,
            mock_mode=mock_mode
        ),
        GenericLogEventSource(mock_mode=mock_mode),
    ]
    
    return EventAggregator(sources)

# Made with Bob
