import os
import sys
import requests,json

if sys.platform == "win32":
    import msvcrt
    # Binary mode is required for persistent mode on Windows.
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stderr.fileno(), os.O_BINARY)

from splunk.persistconn.application import PersistentServerConnectionApplication


class EchoHandler(PersistentServerConnectionApplication):
    def __init__(self, command_line, command_arg):
        PersistentServerConnectionApplication.__init__(self)
        #Will eventually get the user and pw from not admin/changeme
        self.user = 'admin'
        self.pw = 'changeme'


    def handle(self,in_string):
        req = requests.get('https://127.0.0.1:8089/servicesNS/Nobody/parking-app/storage/collections/data/mycollection',verify=False,auth=(self.user,self.pw))
        address= str(req.json()[0]['address'])
        addr = address.replace(" ","+")
        endpoint = 'https://maps.googleapis.com/maps/api/geocode/json?address='+addr+',+San+CA&key=AIzaSyAGuFPDdzKV8Y6h6UHnGoqf0HZmBRCqxo4'
        response = requests.get(endpoint).json()
        return {'payload': response,  # Payload of the request.
                'status': 200          # HTTP status code
        }
