from flask import Flask, render_template

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gallery')
def gallery_page():
    return render_template('portfolio/index.html')

@app.route('/kim-kidney')
def kim_kidney():
    return render_template('kim-kidney/index.html')
