import http.server
import socketserver
import os
import threading

os.chdir("C:\\Users\\zack1\\Downloads\\python\\python-jungle")
PORT = 8090

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, format, *args):
        pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CORSHandler) as httpd:
        print("[OK] Python Jungle running at http://localhost:{}/".format(PORT))
        httpd.serve_forever()

start_server()