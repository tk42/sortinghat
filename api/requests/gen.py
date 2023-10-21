import json

def text_to_json(text):
    # テキストを"|"で分割
    elements = text.split("\t")

    # それぞれの値を変換
    previous = int(elements[0]) - 1
    mi_values = [int(i) + 1 for i in elements[1:9]]

    # 10列目の文字列の変換
    leader_map = {
        "上の２つ以外": 1,
        "サブリーダー（リーダーを支える）": 3,
        "リーダー（チームやクラスのために）": 8
    }
    if elements[9] == "":
        leader = 0
    else:
        leader = leader_map[elements[9]]

    # 11列目の文字列の変換
    eyesight_map = {
        "いいえ、どこでもいいよ": 1,
        "あの、目のかんけいではないけど、できれば前がいいな…": 3,
        "はい！！目のかんけいで…": 8
    }
    if elements[10] == "":
        eyesight = 0
    else:
        eyesight = eyesight_map[elements[10]]

    # 12列目の数列の変換
    if elements[11] == "":
        dislikes = []
    else:
        dislikes = [int(i) - 1 for i in elements[11].replace("\"", "").replace("・", ",").replace("、", ",").split(",")]

    # JSON形式で結果を返す
    return json.dumps({
        "previous": previous,
        "mi_a": mi_values[0],
        "mi_b": mi_values[1],
        "mi_c": mi_values[2],
        "mi_d": mi_values[3],
        "mi_e": mi_values[4],
        "mi_f": mi_values[5],
        "mi_g": mi_values[6],
        "mi_h": mi_values[7],
        "leader": leader,
        "eyesight": eyesight,
        "dislikes": dislikes
    })



with open("2023-10_removed_column.tsv", "r") as f:
    text = f.readlines()

for i in range(len(text)):
    text[i] = text[i].replace("\n", "")
    result = text_to_json(text[i])
    print(i, result[1:-1])
