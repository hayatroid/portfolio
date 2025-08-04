import json
import requests


user_name = 'hayatroid'

# AtCoder レーティングの取得
url = f'https://kenkoooo.com/atcoder/proxy/users/{user_name}/history/json'
res = requests.get(url).json()
rating = res[-1]['NewRating']

# 色の計算
color_list = ['#808080', '#804000', '#008000', '#00c0c0', '#0000ff', '#c0c000', '#ff8000', '#ff0000']
color = '#000000' if rating == 0 else '#ff0000' if rating >= 3200 else color_list[rating // 400]

# Rust で解いた問題数，Python で解いた問題数の取得
url = f'https://kenkoooo.com/atcoder/atcoder-api/v3/user/language_rank?user={user_name}'
res = requests.get(url).json()
count_rust = 0
count_python = 0
for r in res:
    if r['language'] == 'Rust':
        count_rust = r['count']
    if r['language'] == 'Python':
        count_python = r['count']

# json ファイルとして保存
data = {
    'rating': rating,
    'color': color,
    'count_python': count_python,
    'count_rust': count_rust,
}
with open('atcoder_info.json', mode='w') as f:
    f.write(json.dumps(data))
