+++
title = "utterances から giscus に移行してみた"
description = "utterances から giscus に移行した理由、および utterances から giscus への移行方法について説明しました。"
date = 2025-08-08

[extra]
emoji = "💎"
+++

このサイトのコメント欄を [utterances](https://utteranc.es/) から [giscus](https://giscus.app/) に移行してみました。

<!-- toc -->

## モチベーション

かつて [utterances でコメント欄をつけてみた](https://hayatro.id/notes/comments-with-utterances/) のですが、コメントへのリアクションはできるものの、ノート自体へのリアクションはできない状況でした。少し寂しいなと思っていたところ、utterances から派生した [giscus](https://giscus.app/) ではそれができるとわかり、移行を決めました。

## utterances から giscus への移行方法

utterances のコメントを管理していたリポジトリで以下を行いました。

1. [giscus app](https://github.com/apps/giscus) をインストールする。
2. Discussions 機能を有効にする。
3. Issues を Discussions に移していく。Announcements カテゴリを選択すると Discussion の作成をできるのがメンテナと giscus のみになり、よさそう。
4. [giscus のサイト](https://giscus.app/) の空欄を埋め、出てきた script タグで既存の script タグを置き換える。

適当にポチポチしていたらコメント欄が置き換わっていてびっくりしました。

## おわりに

↓ このノートのリアクションは自由に使っていただいて構いません。みなさんのリアクションお待ちしております。
