from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gallery')
def gallery_page():
    return render_template('portfolio/index.html')

@app.route('/card')
def card_page():
    return render_template('card/index.html')

@app.route('/kim-kidney')
def kim_kidney():
    return render_template('kim-kidney/index.html')

@app.route('/following')
def following():
    return render_template('following/index.html')

@app.route('/following/people', methods=['GET'])
def get_following_people():
    if request.method == 'GET':
        data = []
        con = sqlite3.connect('address-book.db')
        cur = con.cursor()
        for row in cur.execute('select * from people'):
            data.append(tuple(row))
        con.close()
        return {'data': data }
    else:
        return {'Error': 'Wrong method, clown'}
