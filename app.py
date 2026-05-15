from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():

    dados_setores = None
    top_funcoes = None
    total = 0
    mensagem = None

    if request.method == "POST":

        file = request.files["arquivo"]

        tabelas = pd.read_html(file)
        df = tabelas[0]
        
        #resto do processamento
        mensagem = "Arquivo enviado com sucesso! Clique abaixo para visualizar os dados."

        df.columns = df.iloc[1]
        df = df[2:]
        df = df.reset_index(drop=True)

        setores = [
            "Whats GN",
            "Whats GV",
            "CB Commerce",
            "Whats Franquia"
        ]

        df_filtrado = df[df["Setor Fim"].isin(setores)]

        df_filtrado["Função do Sistema"] = (
            df_filtrado["Função do Sistema"]
            .astype(str)
            .str.strip()
            .str.upper()
            .str.replace(r"\s+", " ", regex=True)
        )

        dados_setores = {
            "Whats GN": {
                "total": (df_filtrado["Setor Fim"] == "Whats GN").sum(),
                "chamados": df_filtrado[
                    (df_filtrado["Setor Fim"] == "Whats GN") &
                    (df_filtrado["CHAMADO"].notna())
                ].shape[0]
            },
            "Whats GV": {
                "total": (df_filtrado["Setor Fim"] == "Whats GV").sum(),
                "chamados": df_filtrado[
                    (df_filtrado["Setor Fim"] == "Whats GV") &
                    (df_filtrado["CHAMADO"].notna())
                ].shape[0]
            },
            "CB Commerce": {
                "total": (df_filtrado["Setor Fim"] == "CB Commerce").sum(),
                "chamados": df_filtrado[
                    (df_filtrado["Setor Fim"] == "CB Commerce") &
                    (df_filtrado["CHAMADO"].notna())
                ].shape[0]
            },
            "Whats Franquia": {
                "total": (df_filtrado["Setor Fim"] == "Whats Franquia").sum(),
                "chamados": df_filtrado[
                    (df_filtrado["Setor Fim"] == "Whats Franquia") &
                    (df_filtrado["CHAMADO"].notna())
                ].shape[0]
            }
        }

        top_funcoes = (
            df_filtrado["Função do Sistema"]
            .value_counts()
            .head(5)
        )

        total = len(df_filtrado)

    return render_template(
        "index.html",
        dados_setores=dados_setores,
        top_funcoes=top_funcoes,
        total=total
    )

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)