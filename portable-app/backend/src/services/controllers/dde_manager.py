import sys
import json
import dde
from typing import Dict, Any, Tuple
import threading
from ...init.rslinx.init import (
    initialize_dde_connection,
    cleanup_dde_resources,
    validate_connection
)

class DDEConnectionManager:
    def __init__(self):
        self.server = None
        self.conversation = None
        self._lock = threading.Lock()
        self.connected = False
        self.max_retries = 3
        self.retry_delay = 1.0  # second
        
    def initialize(self, server_name: str = "RSLinx", topic: str = "ExcelLink") -> Tuple[bool, str]:
        """Initialize DDE connection with RSLinx"""
        with self._lock:
            try:
                if self.connected:
                    return True, "Already connected"
                
                self.server, self.conversation, error = initialize_dde_connection(
                    server_name,
                    topic,
                    self.max_retries,
                    self.retry_delay
                )
                
                if error:
                    return False, error
                
                self.connected = True
                return True, "Connection successful"
                
            except Exception as e:
                self._cleanup()
                return False, str(e)
    
    def _cleanup(self):
        """Clean up DDE resources"""
        cleanup_dde_resources(self.server, self.conversation)
        self.server = None
        self.conversation = None
        self.connected = False

    def disconnect(self) -> Tuple[bool, str]:
        """Disconnect from DDE server"""
        with self._lock:
            try:
                self._cleanup()
                return True, "Disconnected successfully"
            except Exception as e:
                return False, str(e)

    def read_tag(self, tag: str) -> Dict[str, Any]:
        """Read a single tag value with retry logic"""
        with self._lock:
            try:
                if not self.connected:
                    success, message = self.initialize()
                    if not success:
                        return {'value': None, 'error': f"Connection failed: {message}"}
                
                # Validate connection before reading
                is_valid, error = validate_connection(self.conversation, tag)
                if not is_valid:
                    # Try to reconnect once
                    self._cleanup()
                    success, message = self.initialize()
                    if not success:
                        return {'value': None, 'error': f"Reconnection failed: {message}"}
                
                value = self.conversation.Request(tag)
                return {'value': value, 'error': None}
                
            except Exception as e:
                return {'value': None, 'error': str(e)}

    def write_tag(self, tag: str, value: Any) -> Dict[str, Any]:
        """Write a value to a tag"""
        with self._lock:
            try:
                if not self.connected:
                    success, message = self.initialize()
                    if not success:
                        return {'success': False, 'error': f"Connection failed: {message}"}
                
                # Validate connection before writing
                is_valid, error = validate_connection(self.conversation, tag)
                if not is_valid:
                    # Try to reconnect once
                    self._cleanup()
                    success, message = self.initialize()
                    if not success:
                        return {'success': False, 'error': f"Reconnection failed: {message}"}
                
                # Format value for DDE
                formatted_value = str(value)
                self.conversation.Poke(tag, formatted_value)
                return {'success': True, 'error': None}
                
            except Exception as e:
                return {'success': False, 'error': str(e)}

    def validate_tag(self, tag: str) -> Dict[str, Any]:
        """Validate if a tag exists and is accessible"""
        with self._lock:
            try:
                if not self.connected:
                    success, message = self.initialize()
                    if not success:
                        return {'valid': False, 'error': f"Connection failed: {message}"}
                
                is_valid, error = validate_connection(self.conversation, tag)
                return {'valid': is_valid, 'error': error if not is_valid else None}
                
            except Exception as e:
                return {'valid': False, 'error': str(e)}


def main():
    """Command-line interface for the DDE manager"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command provided'}))
        sys.exit(1)

    command = json.loads(sys.argv[1])
    manager = DDEConnectionManager()

    try:
        if command['action'] == 'init':
            server_name = command.get('application', 'RSLinx')
            topic = command.get('topic', 'ExcelLink')
            success, message = manager.initialize(server_name, topic)
            print(json.dumps({'success': success, 'message': message}))
            
        elif command['action'] == 'read':
            result = manager.read_tag(command['tag'])
            print(json.dumps(result))
            
        elif command['action'] == 'write':
            result = manager.write_tag(command['tag'], command['value'])
            print(json.dumps(result))
            
        elif command['action'] == 'validate':
            result = manager.validate_tag(command['tag'])
            print(json.dumps(result))
            
        elif command['action'] == 'disconnect':
            success, message = manager.disconnect()
            print(json.dumps({'success': success, 'message': message}))
    
    except Exception as e:
        print(json.dumps({'error': str(e)}))
    finally:
        manager.disconnect()

if __name__ == '__main__':
    main()