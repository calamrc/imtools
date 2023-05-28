from socket import gethostname
from flask import Flask, request

app =  Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def generate():
    if request.method == "POST":
        print(request.form)
    else:
        return "<p>Hello, World!</p>"

if __name__ == '__main__':
    #  db.create_all()
    if 'liveconsole' not in gethostname():
        app.run()
