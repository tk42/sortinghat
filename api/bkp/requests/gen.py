import json


def text_to_dict(text):
    # テキストを"|"で分割
    elements = text.split("\t")

    # それぞれの値を変換
    sex = int(elements[0])
    previous = int(elements[1]) - 1
    mi_values = [int(i) + 1 for i in elements[2:10]]

    # 10列目の文字列の変換
    leader_map = {
        "上の２つ以外": 1,
        "サブリーダー（リーダーを支える）": 3,
        "リーダー（チームやクラスのために）": 8,
    }
    if elements[10] == "":
        leader = 0
    else:
        leader = leader_map[elements[10]]

    # 11列目の文字列の変換
    eyesight_map = {
        "いいえ、どこでもいいよ": 1,
        "あの、目のかんけいではないけど、できれば前がいいな…": 3,
        "はい！！目のかんけいで…": 8,
    }
    if elements[11] == "":
        eyesight = 0
    else:
        eyesight = eyesight_map[elements[11]]

    # 12列目の数列の変換
    if elements[12] == "":
        dislikes = []
    else:
        elements[12] = elements[12][:-1] if elements[12].endswith(",") else elements[12]
        dislikes = [
            int(i) - 1
            for i in elements[12]
            .replace('"', "")
            .replace("・", ",")
            .replace("、", ",")
            .split(",")
        ]

    # dict形式で結果を返す
    return {
        "sex": sex,
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
        "dislikes": dislikes,
    }


with open("2024-07_removed_column.tsv", "r") as f:
    text = f.readlines()

result = []
for i in range(len(text)):
    text[i] = text[i].replace("\n", "")
    d = text_to_dict(text[i])
    # print(i, d)
    result += [d]

# print(result)
print(json.dumps(result, indent=4))
