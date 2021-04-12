# twilio-voice-recording-to-s3

Twilio 上で録音された録音データを自動的に S3 にアップロードします。アップロードが完了すると、該当する録音データを Twilio 上から削除します。

## 準備

事前に以下の準備をしておいてください。

### Twilio CLI のインストール

[こちらの記事](https://qiita.com/mobilebiz/items/456ce8b455f6aa84cc1e)を参考にしてください。

### Twilio CLI サーバーレスプラグインのインストール

[こちらの記事](https://qiita.com/mobilebiz/items/fb4439bf162098e345ae)を参考にしてください。

### AWS 側の準備

S3 にバケットを作成します（バケット名を控えておいてください）。  
S3 にアップロードする権限をもった、AWS のアクセスキーとシークレットアクセスキーを控えておきます。

## ソースコードの準備

適当な作業ディレクトリに移動して、

```sh
git clone https://github.com/twilioforkwc/twilio-voice-recording-to-s3.git
cp .env.sample .env
```

コピーした`.env`をエディタで開き、以下の内容で更新します。

| 項目名                | 内容                                                   |
| :-------------------- | :----------------------------------------------------- |
| ACCOUNT_SID           | Twilio のアカウント SID（AC から始まる文字列）         |
| AUTH_TOKEN            | 同じく Auth Token                                      |
| AWS_ACCESS_KEY        | AWS のアクセスキー                                     |
| AWS_SECRET_ACCESS_KEY | 同じくシークレットアクセスキー                         |
| AWS_REGION            | AWS のリージョン（デフォルトは東京リージョン）         |
| AWS_S3_BUCKET         | 録音データを保管するバケット名                         |
| AWS_S3_PREFIX         | 録音データのプレフィックス（デフォルトは`Recordings`） |

## デプロイ

<注意> Twilio CLI プロファイルが対象の Twilio プロジェクトのものであることを確認してください。違うプロファイルでデプロイをすると、間違ったプロジェクト内に Functions ができてしまいます。
プロファイルを切り替えるときは、`twilio profiles:use プロファイル名`で行います。

以下のコマンドを使って、プログラムをデプロイします。

```sh
twilio serverless:deploy --force
```

以下のような感じでデプロイがされれば成功です。

```sh
Deploying functions & assets to the Twilio Runtime

Account         ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Token           5c19****************************
Service Name    twilioVoiceRecordingToS3
Environment     dev
Root Directory  /Users/katsumi/Documents/workspace/Node.js/twilioVoiceRecordingToS3
Dependencies    aws-sdk, axios, s3-upload-stream, twilio
Env Variables   AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, AWS_S3_PREFIX
Runtime         undefined

✔ Serverless project successfully deployed

Deployment Details
Domain: twiliovoicerecordingtos3-XXXX-dev.twil.io
Service:
   twilioVoiceRecordingToS3 (ZSe8d5680a4c68e08a6bc5a41e964588c9)
Environment:
   dev (ZEdb28386fa0b2467c75db08f29b263b5b)
Build SID:
   ZB44ca257c919636d6c8f23f33d5f8d1d1
Runtime:
   node12
View Live Logs:
   https://www.twilio.com/console/assets/api/ZSe8d5680a4c68e08a6bc5a41e964588c9/environment/ZEdb28386fa0b2467c75db08f29b263b5b
Functions:
   https://twiliovoicerecordingtos3-XXXX-dev.twil.io/export-s3
Assets:

```

最後の方に表示される`Functions:`の URL（ https://twiliovoicerecordingtos3-XXXX-dev.twil.io/export-s3 ）を控えておいてください（XXXX のところに数字が入ります）。

## Twilio 側の設定

\<Record>動詞の [RecordingStatusCallback](https://jp.twilio.com/docs/voice/twiml/record#attributes-recording-status-callback) に、今控えておいた Functions の URL を指定します。

## まとめ

以上でセットアップは終了です。  
あとは実際にテストをして、Twilio 上に録音データが残っていないことと、S3 に録音データがアップロードされたことを確認してください。  
必要に応じて、S3 の暗号化を別途設定しておくことをおすすめします。
