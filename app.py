import http.server
import socketserver
from jinja2 import Environment, FileSystemLoader
import urllib.parse
import os

PORT = 8000
env = Environment(loader=FileSystemLoader('templates'))

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path).path
        
        # Serve static files normally
        if parsed_path.startswith('/static/'):
            return super().do_GET()
            
        # Determine which template to render
        try:
            if parsed_path == '/' or parsed_path == '/index.html':
                template = env.get_template('index.html')
            elif parsed_path == '/events':
                template = env.get_template('events.html')
            elif parsed_path.startswith('/event/'):
                template = env.get_template('event_detail.html')
            else:
                self.send_error(404, "Page not found")
                return
                
            html = template.render()
            
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Template Error: {str(e)}")

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Navigate to http://localhost:8000 to view the demo UI.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
