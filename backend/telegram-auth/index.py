import json
import os
from typing import Dict, Any, Optional
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError
from telethon.sessions import StringSession

sessions: Dict[str, TelegramClient] = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram authentication handler for phone auth, code verification, and 2FA
    Args: event with httpMethod, body containing phone/code/password
    Returns: HTTP response with session data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        api_id = os.environ.get('TELEGRAM_API_ID')
        api_hash = os.environ.get('TELEGRAM_API_HASH')
        
        if not api_id or not api_hash:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Telegram API credentials not configured'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        phone = body_data.get('phone')
        code = body_data.get('code')
        password = body_data.get('password')
        session_id = event.get('headers', {}).get('x-session-id', 'default')
        
        if action == 'send_code':
            client = TelegramClient(StringSession(), api_id, api_hash)
            sessions[session_id] = client
            
            async def send_code_async():
                await client.connect()
                sent = await client.send_code_request(phone)
                return sent.phone_code_hash
            
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            phone_code_hash = loop.run_until_complete(send_code_async())
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'phone_code_hash': phone_code_hash,
                    'session_id': session_id
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'verify_code':
            client = sessions.get(session_id)
            if not client:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Session not found'}),
                    'isBase64Encoded': False
                }
            
            phone_code_hash = body_data.get('phone_code_hash')
            
            async def verify_code_async():
                try:
                    await client.sign_in(phone, code, phone_code_hash=phone_code_hash)
                    return {'success': True, 'needs_password': False}
                except SessionPasswordNeededError:
                    return {'success': True, 'needs_password': True}
                except PhoneCodeInvalidError:
                    return {'success': False, 'error': 'Invalid code'}
            
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(verify_code_async())
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'verify_password':
            client = sessions.get(session_id)
            if not client:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Session not found'}),
                    'isBase64Encoded': False
                }
            
            async def verify_password_async():
                await client.sign_in(password=password)
                session_string = client.session.save()
                me = await client.get_me()
                return {
                    'success': True,
                    'session_string': session_string,
                    'user': {
                        'id': me.id,
                        'username': me.username,
                        'phone': me.phone,
                        'first_name': me.first_name
                    }
                }
            
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(verify_password_async())
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
