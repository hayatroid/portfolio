import json
import requests


url = 'https://atcoder.jp/users/hayatroid/history/json'
res = requests.get(url).json()
rating = res[-1]['NewRating']

url = 'https://kenkoooo.com/atcoder/atcoder-api/v3/user/language_rank?user=hayatroid'
res = requests.get(url).json()
count_rust = 0
count_python = 0

for r in res:
    if r['language'] == 'Rust':
        count_rust = r['count']
    if r['language'] == 'Python':
        count_python = r['count']

res = {
    "rating": rating,
    "count_python": count_python,
    "count_rust": count_rust,
}

with open('atcoder_info.json', mode='w') as f:
    f.write(json.dumps(res))
