+++
title = "Zola でサイトを作った"
description = "Zola でサイトを作った理由、Zola の導入方法、および実装した主な機能について説明しました。"
date = 2024-05-24

[extra]
emoji = "🦀"
+++

このサイトを [Zola](https://www.getzola.org/) で作りました。[リポジトリはこちらから。](https://github.com/hayatroid/portfolio)

<!-- toc -->

## モチベーション
このサイトを作った理由は以下の通りです。

- 自分のドメインでブログを持ちたかった。
- 自分のドメインでツールを運用したかった。

前者については、以前にも自分のドメインで WordPress のブログを持っていたことがあるのですが、ローカルエディタで編集できる（Markdown で執筆できる）環境が欲しいと思い、作り替えることにしました。

後者については、よく使うツールを自分で作ってみたいという気持ちと、外部ツールに頼ってばかりなのはセキュリティ的によくないという気持ちがあり、このサイト上に実装してみることにしました。

Markdown でブログが書ける静的サイトジェネレータを調べたところ、いくつか見つかったのですが、Rust 製という点に惹かれて [Zola](https://www.getzola.org/) を選びました。`zola build` をする度に高速すぎて笑っております。

## Zola の導入方法
[Zola のドキュメント](https://www.getzola.org/documentation/) を見ながら導入しました。すべて英語でしたが、例示されているコードがわかりやすくて助かりました。大体のことはこのドキュメントと [Tera のドキュメント](https://keats.github.io/tera/docs/#templates) に書かれているので、困ったときはこれらを参照するとよさそうです。

とはいえ、最初のうちはドキュメントを読んでも必要な機能の実装方法がわからないことが多かったです。そこで、[Zola のテーマ一覧](https://www.getzola.org/themes/) から必要な機能を含むテーマを探し、そのソースコードを参考にしました。

テーマをそのまま使うことも考えたのですが、そんなにページ数が多くならないと思ったので、すべて自分で書くことにしました。その結果、 $\infty$ 行の `.html` と `.scss` を書くことになり泣いてしまいました。

## 実装した主な機能

### $\KaTeX$ による数式表示
数式表示機能は真っ先に欲しかったので導入しました。例えば以下のように数式が書けます。
$$
m\ddot{\bm{r}} = \bm{F}
$$
これは、[$\KaTeX$ のドキュメント](https://katex.org/docs/autorender) にある以下のコードを `templates/cdn/katex.html` に保存し、`</body>` の直前に `{% include "cdn/katex.html" %}` を追加することで実現しました。
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" integrity="sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js" integrity="sha384-hIoBPJpTUs74ddyc4bFZSM1TVlQDA60VBbJS0oA934VSz82sBx1X7kSx2ATBDIyd" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js" integrity="sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk" crossorigin="anonymous"></script>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        renderMathInElement(document.body, {
          // customised options
          // • auto-render specific keys, e.g.:
          delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\(', right: '\\)', display: false},
              {left: '\\[', right: '\\]', display: true}
          ],
          // • rendering keys, e.g.:
          throwOnError : false
        });
    });
</script>
```

これで、記事の Markdown 内に
```tex
$$
m\ddot{\bm{r}} = \bm{F}
$$
```
と記述するだけで数式が書けるようになりました。

### サムネイルを絵文字に変更
以前のブログでは、サムネイル画像を作ることが記事執筆の効率を下げる障壁となっていました。
このブログでは、サムネイルを絵文字にすることで、気軽に投稿を増やせるようにしました。

実装方法については、この記事の [Front matter](https://www.getzola.org/documentation/content/page/#front-matter) が参考になるでしょう。以下のように `[extra]` の中に `emoji` という項目を設定しています。

```toml
+++
title = "Zola でサイトを作った"
description = "Zola でサイトを作った理由、Zola の導入方法、および実装した主な機能について説明しました。"
date = 2024-05-24

[extra]
emoji = "🦀"
+++
```

この状態で、ページのテンプレートに `{{ page.extra.emoji }}` と記述すると、各記事に設定した絵文字を呼び出すことができます。

### ツールの実装
作ったツールは [Tools](https://hayatro.id/tools/) に置いてあります。

Markdown に HTML タグを埋め込むのは避けたいと思い、[Shortcodes](https://www.getzola.org/documentation/content/shortcodes/) という機能を使って実装しました。これにより、どこからでもツールを呼び出すことができて便利です。例えば、こんな風に。
{{ modinv() }}

これは、`templates/shortcodes/modinv.html` を用意して、Markdown 内で `{{/* modinv() */}}` と記述することで呼び出しています。

現在は JavaScript で実装できるツールのみを置いていますが、将来的にはバックエンド処理が必要なツールも作りたいと考えています。

### デザインの実装
自分好みの見た目にするため、リセット CSS を入れた状態からすべてを手書きしました。`.scss` のファイル分割や変数・関数についてのベストプラクティスがわからず、$\infty$ 行のコードを生成してしまいました。反省しています。

ですが、すべて手書きした分、細かいところにも気を配れたと思います（スクロールバーの有無によるガタつきを無くすなど）。まだまだ改善すべき部分もありますが、このサイトの見た目には満足しています。

## おわりに
これから、学習した内容や日常の記録をこのサイトにいっぱい残したいと思っています。よろしくおねがいします。
