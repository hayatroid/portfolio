+++
title = "毎日自動で AtCoder のレーティングを取得し Zola 製サイトに反映させる"
description = "GitHub Actions を使って、毎日自動で AtCoder のレーティングと解いた問題数を取得し、Zola 製のポートフォリオに反映させる方法を説明しました。"
date = 2024-05-29

[extra]
emoji = "🤖"
+++

現在 [About ページ](https://hayatro.id/about/) に AtCoder のレーティングや解いた問題数を載せているのですが、その更新を自動化しました。

<!-- toc -->

## どうやって自動化したか
- GitHub Actions の cron を使って、1 日 1 回 AtCoder のレーティングと解いた問題数の情報を取りに行くようにしました。
- 取りに行った情報を json ファイルに保存するようにしました。
- Zola の `load_data` 関数を使って、保存した json ファイルから情報を読み出すようにしました。

## なぜその方法を選んだか
他の方法として、アクセスのたびに API を叩くことも考えたのですが、サーバーへの負荷を考慮し、そこまでリアルタイム性が重要でないので 1 日 1 回の cron で十分だと判断しました。

また、Zola の `load_data` 関数は直接 URL を指定できるので Zola だけで処理を完結させることも考えたのですが、目的のデータを取り出すのが大変だったので、Python でデータを整えてから Zola に渡すことにしました。

## 実装方法

### まずは手元でテスト
初めに以下の Python コードを書きました。
AtCoder のレーティング、色、Rust で解いた問題数、Python で解いた問題数を取得できます。

ここでは [AtCoder の JSON](https://x.com/chokudai/status/1001332212648701952) と [AtCoder Problems API / Datasets](https://github.com/kenkoooo/AtCoderProblems/blob/master/doc/api.md) を使用させていただいてます（サーバーへの負荷を考慮し、間隔を空けて実行しなければならないことに注意が必要です）。

```python
import json
import requests


user_name = 'hayatroid'

# AtCoder レーティングの取得
url = f'https://atcoder.jp/users/{user_name}/history/json'
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
```

これを実行すると、以下のような json ファイルが生成されます。

```json
{"rating": 1603, "color": "#0000ff", "count_python": 232, "count_rust": 590}
```

あとは Zola のテンプレートに以下のコードを追加するだけで、AtCoder のレーティングを色付きで表示させることができます。
解いた問題数についても似たような感じで記述すればよいです。

```html
{% set data = load_data(path="atcoder_info.json", format="json") %}
{% set rating = data["rating"] %}
{% set color = data["color"] %}
<span style="font-weight: bold; color: {{ color }}">{{ rating }}</span>
```

さらにこれを `templates/shortcodes/atc_rating.html` に保存すると、Markdown 内で `{{/* atc_rating() */}}` と記述するだけで呼び出すことができて便利です。例えば、こんな風に → {{ atc_rating() }}。

### GitHub Actions で自動化
最後に Python コード実行 → json の更新 → Zola のビルドを GitHub Actions で定期実行させればおしまいです。
以下のような yml ファイルを書きました。大まかな流れとしては、

- `cron: '0 15 * * *'` で毎日 0 時に実行（日本時間は + 9 時間）。
- Python をセットアップし、`requests` モジュールをインストール。
- `atcoder_info.py` を実行。
- `atcoder_info.json` に変更があれば差分を push。
- （ジョブを分けたので、差分の pull。）
- Zola をビルドしてデプロイ。

といった感じです。

```yml
name: Zola on GitHub Pages
on:
  schedule:
    - cron: '0 15 * * *'
  push:
    branches:
      - main

jobs:
  update_atcoder_info:
    name: Update atcoder_info
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: python -m pip install --upgrade pip requests

      - name: Run atcoder_info.py
        run: python3 atcoder_info.py

      - name: Push changes
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git remote set-url origin https://github-actions:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}
          git config --global user.name "${GITHUB_ACTOR}"
          git config --global user.email "${GITHUB_ACTOR}@users.noreply.github.com"
          git add .
          if (git diff --cached --shortstat | grep '[0-9]'); then
            git commit -m "[GitHub Actions] Update atcoder_info"
            git push origin HEAD:${GITHUB_REF}
          fi

  build:
    needs: [update_atcoder_info]
    name: Publish site
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Pull changes
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git remote set-url origin https://github-actions:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}
          git pull

      - name: Build and deploy
        uses: shalzz/zola-deploy-action@v0.18.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

これにて、ポートフォリオに載せてる AtCoder のレーティングや解いた問題数が毎日 0 時に自動更新されるようになりました！

## おわりに
これまで GitHub や GitHub Actions を使う機会がそこまで多くなかったので、今年は GitHub ともっと仲良くなりたいな～と思っています。
