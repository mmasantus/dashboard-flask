from flask import Flask, render_template, request
import pandas as pd
import os

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():

    dados_setores = None
    gv_antecipada = None
    total = 0
    top_funcoes = []

    if request.method == "POST":

        file = request.files["arquivo"]

        tabelas = pd.read_html(file)
        df = tabelas[0]

        # -----------------------------
        # LIMPEZA
        # -----------------------------
        df.columns = df.iloc[1]
        df = df[2:].reset_index(drop=True)
        df.columns = df.columns.str.strip()

        df["Tempo de Operação"] = df["Tempo de Operação"].astype(str).str.strip().str.upper()
        df["Responsável"] = df["Responsável"].astype(str).str.strip().str.upper()
        df["Setor Fim"] = df["Setor Fim"].astype(str).str.strip()
        df["Função do Sistema"] = df["Função do Sistema"].astype(str).str.strip().str.upper()

        # -----------------------------
        # SOMENTE FINALIZADOS
        # -----------------------------
        df_finalizados = df[df["Tempo de Operação"] != "NÃO FINALIZADO"]

        # -----------------------------
        # SETORES
        # -----------------------------
        setores = ["Whats GN", "Whats GV", "CB Commerce", "Whats Franquia"]

        df_filtrado = df_finalizados[df_finalizados["Setor Fim"].isin(setores)]

        dados_setores = {}

        for setor in setores:
            base = df_filtrado[df_filtrado["Setor Fim"] == setor]

            dados_setores[setor] = {
                "total": len(base),
                "chamados": base["CHAMADO"].notna().sum()
            }

        total = len(df_filtrado)

        # -----------------------------
        # GV ANTECIPADA
        # -----------------------------
        gv_pessoas = [
            "RAFAELLA CRISTINY JACINTO CAMILO",
            "VANESSA DUARTE",
            "MARCIO MIRANDA ALVES DOS SANTOS",
            "WILLIANE BORGES",
            "LUIS GUILHERME TEODORO DOS SANTOS",
            "ADRIANA CONCEICAO DE OLIVEIRA",
            "DANIELA COELHO"
        ]

        df_gv = df_finalizados[
            (df_finalizados["Setor Fim"] == "Atend. - GV Antecipada") &
            (df_finalizados["Responsável"].isin(gv_pessoas))
        ]

        gv_antecipada = {
            "total": len(df_gv),
            "chamados": df_gv["CHAMADO"].notna().sum()
        }

        # -----------------------------
        # TOP ACIONAMENTOS (VERSÃO SIMPLES)
        # -----------------------------
        serie = df_filtrado["Função do Sistema"].value_counts()

        top3 = serie.head(3)
        resto = serie.iloc[3:]

        resultado = []

        # TOP 3
        pos = 1
        for nome, valor in top3.items():
            resultado.append((f"{pos}º {nome}", valor))
            pos += 1

        # RESTO (SÓ FRASE SIMPLES)
        if len(resto) > 0:
            resultado.append(("Demais casos tiveram apenas 1 registro", ""))

        top_funcoes = resultado

    return render_template(
        "index.html",
        dados_setores=dados_setores,
        gv_antecipada=gv_antecipada,
        total=total,
        top_funcoes=top_funcoes
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)