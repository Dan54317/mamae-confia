from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = 'chave_secreta_segura'

# Criar tabela se não existir
def criar_banco():
    conn = sqlite3.connect('usuarios.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

criar_banco()

# Rota principal
@app.route('/')
def home():
    return redirect('/login')

# Página de login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        senha = request.form['senha']
        conn = sqlite3.connect('usuarios.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, senha FROM usuarios WHERE email=?', (email,))
        user = cursor.fetchone()
        conn.close()
        if user and check_password_hash(user[1], senha):
            session['usuario_id'] = user[0]
            return redirect('/painel')
        else:
            return 'Login inválido'
    return render_template('login.html')

# Página de cadastro
@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        email = request.form['email']
        senha = generate_password_hash(request.form['senha'])
        try:
            conn = sqlite3.connect('usuarios.db')
            cursor = conn.cursor()
            cursor.execute('INSERT INTO usuarios (email, senha) VALUES (?, ?)', (email, senha))
            conn.commit()
            conn.close()
            return redirect('/login')
        except:
            return 'Email já cadastrado'
    return render_template('cadastro.html')

# Painel do usuário
@app.route('/painel')
def painel():
    if 'usuario_id' in session:
        return render_template('painel.html')
    else:
        return redirect('/login')

# Logout
@app.route('/logout')
def logout():
    session.pop('usuario_id', None)
    return redirect('/login')

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
