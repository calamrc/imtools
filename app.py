from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__nam__)
app.config["DEBUG"] = True

SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
    username="rccalam",
    password="initiald",
    hostname="rccalam.mysql.pythonanywhere-services.com",
    databasename="rccalam$imtools",
)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_POOL_RECYCLE"] = 299
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

@app.route("/")
def index():
    return "Hello, World!"
