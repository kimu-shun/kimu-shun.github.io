
## 小林 純也

<div class="social-icons">
<a class="social-icon" target="_blank" href="https://github.com/junya005"><img src="img/github.svg" class="to-special-icon"></a>
<a class="social-icon" target="_blank" href="https://junya005.github.io/"><img src="img/website.svg" class="to-special-icon"></a>
</div><br>

### About

#### まとめ

意識したこと<br><br>
今回の制作で意識したことは3つあります。1つ目は、他のプログラマーとの連携を考えました。具体的な行動としては、プレイヤーに外部から呼んでもらう想定の関数や、インターフェースを用意することを意識しました。2つ目は、仕様追加や調整のしやすい設計を考えました。具体的な行動としては、コンポジットやオブジェクト指向を用い、拡張性や再利用性の高いコンポーネントになるように心掛けました。3つ目は、プランナーの方の調整指示に対応しやすくするような工夫を行いました。具体的な行動としては、値を表示させたり、Inspectorで調整できるようにしたりしました。<br><br>
反省点・次へ向けて<br><br>
今回の制作では設計を意識した半面、一部で依存関係が複雑になってしまった箇所があったため、今後の制作ではDIもしくはDIコンテナの導入を検討したいです。また、Inspectorで値を調整できるようにしていたものの、変更するのはプログラマーが担っていたので、値を永続化してプランナーがデバックビルドを実行しながら値調整ができるようなシステムを作ってみたいと思いました



### プレイヤー動作

#### 成果物

<iframe class="ytframe" src="https://www.youtube.com/embed/?autoplay=0&amp;controls=1&amp;disablekb=1&amp;loop=1&amp;mute=1&amp;playlist=s9RpY1LTQ_8&amp;playsinline=1&amp;rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>

プレイヤーキャラクターの操作ロジック設計・実装、
プレイヤーモデルやエフェクト、サウンドの組み込みを
行いました。QRから動作の動画をご確認いただけます。

![image](data/img/prog/progImages_1.jpg)


担当した機能の一覧です。カメラ制御及びUI、ムービーの再生、ギミックは一部を除いて担当外です。※担当したギミックは後のページに掲載しております。

#### 全体像 

![image](data/img/prog/progImages_2.jpg)

プレイヤーモジュール全体のクラス図です。Unityの設計思想に則り、コンポーネント指向をベースに設計しました。各アクションを細かく分割してコンポジットする構造にすることで、今後の機能追加や仕様変更が容易な構成になっています。

#### インタラクト

プレイヤーのインタラクト部分のコードです。ギミック側はIInteractableを実装し、PlayerInteractが当たり判定にて対象を検知後、インタラクトを実行するという構成にしました。これにより、ギミック担当者のプレイヤー接続のコードを省略することができました。

```csharp
/// <summary>
/// インタラクト可能なスクリプトに実装するインターフェース
/// </summary>
public interface IInteractable
{
    /// <summary>
    /// インタラクトを実行する
    /// </summary>
    void OnInteract();

    void OnInteract(int playerIndex) { }
}
```

#### 速度制限

プレイヤーの速度制限のメイン処理です。56, 57行目で、Vector3.ClampMagnitudeを用いて斜め方向への加速も制限しています。59 ～ 63行目では明示的に値の制限をかけています。RigidbodyのlinearVelocityに直接制限をかけているため、ギミックなどから速度の干渉を行えるように、_additionalVelocityという追加のVelocityを用意し、それを最後に合成する形で最終的な速度を反映しています。

```csharp
/// <summary>
/// プレイヤーのインタラクト処理
/// </summary>
public class PlayerInteract : MonoBehaviour
{
    private IInteractable _interactable;

    /// <summary>
    /// インタラクトを実行します
    /// </summary>
    public bool Execute()
    {
        if (_interactable == null)
        {
            Debug.Log("インタラクト対象がありません");
            return false;
        }

        if (_interactable == null) return false;


        _interactable.OnInteract();
        return true;
    }
```

#### 頭の傾き表示

プレイヤーの速度に応じて頭の傾きを反映させる機能のコードです。現
在プレイヤーが進んでいる方向に正しく頭が向くように、プレイヤーの
入力値ではなく速度から方向の計算をしています。また、キャラクター
の動きがカクつかないようにSlerpで補完した値を代入しています。

```csharp
/// <summary>
/// FixedUpdate内で実行想定のVelocity制限メソッド
/// </summary>
public void LimitOnFixedUpdate()
{
    if (_rb == null) { return; }

    if (_isStopLimitter)
    {
        _isStopLimitter = false;
        return;
    }

    Vector3 clampedVelocity = Vector3.ClampMagnitude(_rb.linearVelocity, _velocityLimit.CurrentValue);
    float limitX = clampedVelocity.x, limitZ = clampedVelocity.z;

    if (Mathf.Abs(clampedVelocity.x) > _velocityLimit.CurrentValue)
        limitX = (clampedVelocity.x > 0) ? _velocityLimit.CurrentValue : -_velocityLimit.CurrentValue;

    if (Mathf.Abs(clampedVelocity.z) > _velocityLimit.CurrentValue)
        limitZ = (clampedVelocity.z > 0) ? _velocityLimit.CurrentValue : -_velocityLimit.CurrentValue;

    if (_rb.isKinematic != true)
    {
        Vector3 newVelocity = new Vector3(limitX, _rb.linearVelocity.y, limitZ) + _additionalVelocity;
        _rb.linearVelocity = newVelocity;
    }
}
```

#### 先にいるプレイヤーへのワープ

プレイヤーの距離が離れた時に、先のプレイヤーにテレポートさせる機
能のコードです。ステージの形状に合わせて進路先かどうかの判定をす
るために、Splineを採用しています。

```csharp
private void Update()
{
    if (_splineContainer != null)
    {
        // プレイヤー座標をスプライン上の座標に変換して格納します
        SplineUtility.GetNearestPoint(_splineContainer.Spline, _player1Body.transform.position,
                                        out var player1NearestPoint, out var t1);
        _nearestPoints[_player1Controller.PlayerIndex] = t1;

        SplineUtility.GetNearestPoint(_splineContainer.Spline, _player2Body.transform.position,
                                        out var player2NearestPoint, out var t2);
        _nearestPoints[_player2Controller.PlayerIndex] = t2;
    }

    // 両方のプレイヤーをリスポーンさせる処理
    if (IsBothRespawn == true)
    {
        if (_player1Controller.IsDeath && !_player2Controller.IsDeath)
        {
            _player2Controller.ExecuteDeath();
        }

        if (_player2Controller.IsDeath && !_player1Controller.IsDeath)
        {
            _player1Controller.ExecuteDeath();
        }
    }

    if (UseTeleport == false) { return; }
    if (_player1Controller.IsTeleporting || _player2Controller.IsTeleporting) { return; }

    // プレイヤー同士の距離を判定し、一定距離以上になったらテレポートを実行します
    Vector3 distance = GetPlayerDicetance();
    if (distance.x > _teleportDistance.x || distance.y > _teleportDistance.y || distance.z > _teleportDistance.z)
    {
        PlayerController targetTransform = GetPlayerControllerInBack();
        Vector3 teleportPos = GetPlayerPosInFront();

        targetTransform.Teleport(teleportPos);
    }
}
```

#### デバック表示

プレイヤーの内部数値を簡易的に見れるウィンドウをデバック用として作成して
います。
※PlayerController.csより一部抜粋

```csharp
private void OnGUI()
{
    // デバック表示
    if (_showDebbugWindow)
        ShowParameters();
}

#endregion

#region デバック

/// <summary>
/// デバック用のパラメータ情報を表示するウィンドウを表示する
/// </summary>
private void ShowParameters()
{
    _windowRect = GUI.Window(_windowId, _windowRect, (id) =>
    {
        GUILayout.Label($"速度: {_rb.linearVelocity}");
        GUILayout.Label($"速さ制限: {_velocityLimiter.CurrentMaxSpeed}");
        GUILayout.Label($"水平方向の加速度: {_physicsLocomotion.Acceleration * _moveInput}");
        GUILayout.Label($"ジャンプ力: {_physicsJump.JumpPower}");

        GUILayout.Label($"床に設置しているか: {_checkGround.IsGrounded}");

        GUILayout.Label($"移動入力: {_moveInput}");
        GUILayout.Label($"ブレーキ入力: {_brakeInput}");
        GUILayout.Label($"溜めダッシュ入力: {_chargeDushInput}");

        GUI.DragWindow();
    }, _windowTitle);
}
```

### ピタゴラギミック

#### 成果物

<iframe class="ytframe" src="https://www.youtube.com/embed/?autoplay=0&amp;controls=1&amp;disablekb=1&amp;loop=1&amp;mute=1&amp;playlist=xVYdqyEQHH0&amp;playsinline=1&amp;rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>

ピタゴラギミックのロジック設計・実装、モデルの組み
込みを行いました。

![image](data/img/prog/progImages_3.jpg)

担当した機能の一覧
です。

#### 全体像

![image](data/img/prog/progImages_4.jpg)

ピタゴラギミック全体のクラス図です。こちらはプレイヤーと比べて規
模が小さいため、Controller+オブジェクト指向のシンプルな構成で設
計をしています。入力部分では、インタラクト時にギミック操作のハン
ドラを上書きすることで操作切り替えが容易な構成になっています。

#### インタラクト

プレイヤーとピタゴラギミック間のインタラクトと入力差し替え部分の
コードです。InputManagerにプレイヤーのハンドラのハッシュ配列が
存在しており、それを差し替えることで操作切り替えを実現しています
。

```csharp
public class InputManager : SingletonMonoBehaviour<InputManager>
{
    /// 入力を受け取る側のインターフェース
    public Dictionary<int, IPlayerHandle> CurrentHandles { get; private set; } = new Dictionary<int, IPlayerHandle>();

    /// 入力を検知する側のインターフェース
    public IPlayerInput CurrentInput { get; private set; }

    private Dictionary<int, IPlayerHandle> _defaultHandle = new Dictionary<int, IPlayerHandle>();
```

```csharp
public void OnInteract(int playerIndex)
{
    if (_intervalTime > 0) return;

    StartInterval();

    if (_isControl)
    {
        InputManager.Instance.ResetHandle(playerIndex);

        _isControl = false;

        return;
    }
    else
    {
        InputManager.Instance?.SetCurrentHandle(playerIndex, _handler);

        _handler.SetControlPlayerIndex(playerIndex);
        _isControl = true;
    }
}
```

#### ドアの開閉

ピタゴラギミックのドア開閉ロジックです。呼ぶ側は関数実行を行うだ
けで開閉状態を切り替えられるようにしました。アニメーション関数は
開閉時の最終地点を自由に設定できるようにしています。

```csharp
    /// <summary>
    /// 開閉状態を反転させ、対応するアニメーションを再生する
    /// </summary>
    [Button]
    public void Switch()
    {
        _isOpen = !_isOpen;

        // キャンセル用にトークンを新規作成する
        if (_rotAnimCancellationTokenSource != null)
        {
            _rotAnimCancellationTokenSource.Cancel();
            _rotAnimCancellationTokenSource = null;
        }

        _rotAnimCancellationTokenSource = new CancellationTokenSource();
        CancellationToken token = _rotAnimCancellationTokenSource.Token;

        UpdateStateAsync(token).Forget();
    }

    /// <summary>
    /// 開閉アニメーションを非同期で行う
    /// </summary>
    /// <param name="startRot">回転開始値</param>
    /// <param name="endRot">回転終了値</param>
    /// <param name="duration">アニメーション全体の秒数</param>
    private async UniTask UpdateDoorRotationAsync(Quaternion startRot, Quaternion endRot, float duration, CancellationToken token = default)
    {
        try
        {
            float time = duration;

            while (time > 0.0f)
            {
                Quaternion angle = Quaternion.Slerp(endRot, startRot, time / duration);
                this.transform.rotation = angle;

                time -= Time.deltaTime;
                await UniTask.Yield(token);
            }
        }
        catch (OperationCanceledException ex)
        {
            Debug.Log($"[PytagoraGimmick] 回転アニメーションはキャンセルされました。\n{ex}");
        }
        finally
        {
            // どの場合でも正常な終了状態にする
            this.transform.rotation = endRot;
        }
    }
}
```

### パンチギミック

#### 成果物

frame

パンチギミックのロジック設計・実装、モデルの
組み込みを行いました。

![image](data/img/prog/progImages_5.jpg)

担当した機能の一覧
です。

#### 全体像

![image](data/img/prog/progImages_6.jpg)

ピタゴラギミック全体のクラス図です。ピタゴラギミックと似ており、
Manager+オブジェクト指向を採用しています。こちらも
InputManagerが持っているハンドラ情報を書き換えることで操作切り
替えを実現しています

#### 台の移動

パンチギミックの台座移動部分のコードです。Unityの物理挙動を活用
し、1回実行でインパクトのある爽快な移動になるよう心掛けました。
動作範囲は相対座標で指定することでどの場所であっても使えるように
しています。

```csharp
/// <summary>
/// 座標の制限を掛ける
/// </summary>
/// <remarks>
/// FixedUpdateで呼ばれることを想定
/// </remarks>
private void LimitPosOnFixedUpdate()
{
    float limitVecX = this.transform.localPosition.x;
    if (this.transform.localPosition.x < _min)
    {
        limitVecX = _min;
    }
    else if (this.transform.localPosition.x > _max)
    {
        limitVecX = _max;
    }

    this.transform.localPosition = new Vector3(limitVecX, this.transform.localPosition.y, this.transform.localPosition.z);
}
```

---

## 木村 駿 (プログラマーリーダー)

### プログラムリーダー

#### タスク振り分け

タスク振り分けは制作が始まる前に、ゲームを制作する
前に制作に必要なタスクを書き出し、メンバーの実力を
考えるともに、メンバーのやりたいことを尊重しつつ、
振り分けを行った。

#### データ統合

タスクを振り分けた
のち各要素が出来上
がったらその要素を
つなぎ合わせていき
データの統合をした

### ステージ選択画面

#### ゲーム画面

ステージ選択画面内のステージを選択時のモデルの
アニメーション制作、UIの制作を行った。
キャラの操作や
カメラ制御以外の
部分の制作を担当
した。

#### アニメーション

プレイヤーがステージに近づいたときの
アニメーションを制御するクラス。
アニメーションの段階を配列で管理することで、
コードを変更せずにInspectorから調整できるようにしている。


```csharp
public class StageModleAnimation : MonoBehaviour
{
    private void Start()
    {
        _initalScale = this.transform.localScale.x;
    }
    /// <summary>
    /// ステージに飛行機が近づいたときのアニメーション
    /// </summary>
    /// <returns></returns>
    public async UniTask PlayPopAnimation()
    {
        transform.localScale = Vector3.one;
        
        for (int i = 0; i < _targetScales.Length; i++)
        {
            if (i >= _targetDurations.Length) break;
            await transform.DOScale(_targetScales[i], _targetDurations[i]).AsyncWaitForCompletion();
        }
        /// アニメーション修正
        /// 1.0 -> 1.3 -> 0.9 -> 1.2 -> 1 →　1.2
        /// 最後は1.0じゃなくて1.2くらいにする
        /// 離れたときのアニメーションも追加する
    }

    /// <summary>
    /// ステージから飛行機が離れたときのアニメーション
    /// </summary>
    /// <returns></returns>
    public async UniTask PlayReleaseAnimation()
    {
        await transform.DOScale(_initalScale, _targetDurations[1]).AsyncWaitForCompletion();

    }
}
```

#### View/Presenter

```csharp
/// <summary>
/// ステージ確認のUIを表示するメソッド。引数としてステージタイプを受け取り、そのステージの情報を取得してUIに設定する。
/// </summary>
/// <param name="stageType"></param>
public void ShowStageConfirm(StageType stageType)
{
    var stageResultData = GetStageData(stageType);
    Debug.Log(
   $"<color=cyan>[Stage Data]</color>\n" +
   $"Stage Type: {stageType}\n" +
   $"Stage Name: {stageResultData.stageName}\n" +
   $"Is Cleared: {stageResultData.IsCleared}\n" +
   $"Clear Time: {stageResultData.clearTime:F2}秒\n" +
   $"Super Coin Count: {stageResultData.superCoinCount}\n" +
   $"Coin Count: {stageResultData.coinCount}\n" +
   $"Die Count: {stageResultData.dieCount}"
;
    bool isClear = stageResultData.IsCleared;

    switch (stageType)
    {
        case StageType.Stage1:
            stageModleUIAnimations[0].IsClear = isClear;
            break;
        case StageType.Stage2:
            stageModleUIAnimations[1].IsClear = isClear;
            break;
        case StageType.Stage3:
            stageModleUIAnimations[2].IsClear = isClear;
            break;
    }

    int starCount = stageResultData.redPlayerStarCoinCount + stageResultData.bluePlayerStarCoinCount;
    var stageInfo = GetStageInfo(stageType);
    if (stageInfo != null)
    {
        _view.Show(stageInfo.StageType,isClear,starCount);
    }
}
```

Presenterでステージデータの取得・表示内容の判断を行い、Viewでは受け取った
データをもとにUIの更新・表示]を担当しています。
データ処理とUI処理を分離することで、各クラスの責務を明確にしました。

```csharp

```

#### ゲーム画面

ステージクリア時に、プレイヤーのプレイ結果を確認できるリザルト画面を実装した。
取得したスターコイン・コイン、死亡回数、クリアタイムからそれぞれポイントを
算出し、合計ポイントを「仲良し度」として表示します。
また、結果をただ表示するだけではなく、キャラクターやスコア、ポイント、
バッジなどを順番にアニメーションさせることで、
プレイ結果を段階的に確認できる演出を実装しました。


#### 進行管理

リザルト画面全体の進行を ResultManager に集約した。
ResultFlow()では、ステージ結果を読み込んだ後、
救出キャラクター → スターコイン → コイン → 死亡回数 →
クリアタイム → 仲良し度 → バッジ
の順番でUIを表示しています。
各演出を UniTask の await で待機することで、前の演出が終了してから
次の演出へ進むようにしています。
これにより、UI側の各クラスは自身の表示・アニメーションを担当し、
ResultManagerはリザルト全体の進行管理を担当する構成にしました。

```csharp
private async UniTask ResultFlow()
{

    //T_result = TestLoadResultData();
    _result = LoadResultData();

    // 初期化
    Initalize();

    await UniTask.Delay(2300);
    // リザルトのデータをロード


    // サブキャラを表示
    await _rescuedCharaView.SetCharaSprite(_resultIndex);

    // スターコインの取得表示
    int totalGetStarCoin = _result.redPlayerStarCoinCount + _result.bluePlayerStarCoinCount;
    float starSliderValue = (float)_result.redPlayerStarCoinCount / totalGetStarCoin;
    int starPoint = _scoreConverter.StarCoinScoreConvert(totalGetStarCoin);
    await _starCoin.ViewScore(totalGetStarCoin, _resultMaxDatas[_resultIndex].MaxStarCoin);
    _se.PlaySE(1);
    await _starSlider.PlaySlider(starSliderValue,totalGetStarCoin);
    await _starCoin.ViewPoint(starPoint);
    _se.PlaySE(1);

    // コインの表示
    int totalCoin = _result.redPlayerCoinCount + _result.bluePlayerCoinCount;
    float coinSliderValue = (float)_result.redPlayerCoinCount / totalCoin;
    int coinPoint = _scoreConverter.CoinPoinConvert(totalCoin, _resultMaxDatas[_resultIndex].MaxCoin);
    await _coin.ViewScore(totalCoin, _resultMaxDatas[_resultIndex].MaxCoin);
    _se.PlaySE(1);
    await _coinSlider.PlaySlider(coinSliderValue,totalCoin);
    await _coin.ViewPoint(coinPoint);
    _se.PlaySE(1);

    // 死んだ回数の表示
    int totalDathCount = _result.redPlayerDieCount + _result.bluePlayerDieCount;
    float deathSliderValue = (float)_result.redPlayerDieCount / totalDathCount;
    int deathPoint = _scoreConverter.DeathPointConvert(totalDathCount, _resultMaxDatas[_resultIndex].MaxDieCount);
    await _death.ViewScore(totalDathCount, _resultMaxDatas[_resultIndex].MaxDieCount);
    _se.PlaySE(1);
    await _deathSlider.PlaySlider(deathSliderValue,totalDathCount);
    await _death.ViewPoint(deathPoint);
    _se.PlaySE(1);

    // クリア時間の表示
    int timerPoint = _scoreConverter.TimerPointConvert(_result.clearTime, _resultMaxDatas[_resultIndex].MaxClearTime);
    await _timer.ViewTimer(_result.clearTime, _resultMaxDatas[_resultIndex].MaxClearTime);
    _se.PlaySE(1);
    await _timer.ViewPoint(timerPoint);
    _se.PlaySE(1);

    // 仲良しポイント表示
    int friendShipPoint = starPoint + coinPoint + deathPoint + timerPoint;
    await _friendShipPoin.ViewPoint(friendShipPoint);
    _se.PlaySE(1);

    await _levelView.Play(friendShipPoint);
    _se.PlaySE(0);

    await _badgeView.ViewAnimation(friendShipPoint);
    _se.PlaySE(1);

    _guidUI.SetActive(true);
    _canNext = true;
}
```

#### スコア計算処理

```csharp
public int CoinPoinConvert(int score,int max)
{
    float value = (float)score / max;

    if (value >= 1f)
        return CoinPoint[0];

    if (value >= 0.75f)
        return CoinPoint[1];

    if (value >= 0.5f)
        return CoinPoint[2];

    if (value >= 0.25f)
        return CoinPoint[3];

    return 0;
}
```

```csharp
public int TimerPointConvert(float scoreTime,float maxTime)
{
    // 推定クリア時間以内
    if (scoreTime <= maxTime)
    {
        return TimerPoint[0];
    }

    // 推定クリア時間 + 3分以内
    if (scoreTime <= maxTime + 180f)
    {
        return TimerPoint[1];
    }

    // それ以上
    return 0;
}
```

```csharp
public int DeathPointConvert(int score,int max)
{
    // 推定死亡回数以下
    if (score <= max)
    {
        return DeathPoint[0];
    }

    // 推定死亡回数 + 3 まで
    if (score <= max + 3)
    {
        return DeathPoint[1];
    }

    // 推定死亡回数の2倍以下
    if (score <= max * 2)
    {
        return DeathPoint[2];
    }

    // それ以上
    return DeathPoint[3];
}
```

各項目のポイント計算を ResultManager に直接記述せず、
ScoreConverter に分離した。
コインは最大取得数に対する取得割合、死亡回数は想定死亡回数との比較、
クリアタイムは想定クリア時間との比較によってポイントを決定している。
計算処理をUIの処理から分離することで、リザルト画面の表示処理と
スコア計算処理の責務を分けている。

---

## 清澤 和希

<div class="social-icons">
<a class="social-icon" target="_blank" href="https://github.com/kiyosawa100"><img src="img/github.svg" class="to-special-icon"></a>
</div><br>

### プレイヤーカメラ制御

#### 注視する物の管理

Cinemachineを使ったTarget Groupの管理スクリプトどのオブジェクトを注視したいか、画面にどのオブジェクトを優先的に映したいかなど場面に合わせて関数を作りました。

```csharp
/// <summary>
/// カメラのターゲットグループにプレイヤーがいる状態で
/// ターゲットグループにギミックを追加
/// </summary>
/// <param name="gimmick">注視したいギミック</param>
/// <param name="offsetY">カメラのY軸オフセット</param>
/// <param name="delayTime">カメラのoffset 反映時間 //今は３秒が好ましい</param>
public void AddGimmickToTargetGroup(Transform gimmick, float offsetY, float delayTime)
{
    #region デバック用
    // ランダムなオフセットと時間を生成
    // デバック用にランダム値を生成しているが、必要に応じて固定値に変更可能
    offsetY = Random.Range(-25f, 1f);
    delayTime = Random.Range(0.5f, 5f);
    #endregion
    _cinemachineGroupFraming.Damping = delayTime;
    _cinemachineGroupFraming.DollyRange = new Vector2(offsetY, 6f);

    Debug.Log("Add Target: " + gimmick.name);
}

/// <summary>
/// サブキャラにカメラをフォーカスするために、ターゲットグループをクリアして指定のオブジェクトのみをターゲットにする
/// </summary>
/// <param name="focusObj">サブキャラ</param>
/// <param name="delayTime">遅延時間 見せたら50がいいらしい</param>
public void OnlyTargetGroup(Transform focusObj, float delayTime)
{
    _isCharAmi = true;
    // プレイヤーの動きを止める
    _gameFlowManager.DisablePlayerControl();

    _targetGroup.Targets.Clear();
    _cinemachineGroupFraming.Damping = delayTime;
    AddTarget(focusObj);

}
```

2人のプレイヤーが特例の範囲にいるかを判定するスクリプト。同プレイヤーが連続で判定されないようにしました。

```csharp
/// <summary>
/// 指定範囲内にプレイヤーが2人入ったら、カメラのターゲットグループにギミックオブジェクトを追加
/// </summary>
/// <param name="other"></param>
private void OnTriggerEnter(Collider other)
{
    foreach (var target in _targetGroup.Targets)
    {
        if (target.Object == other.gameObject.transform)
        {
            _playerManager.DisableTeleport();
            _count++;
            Debug.Log("A" + _count);
            if (_count == 2)
            {
                //_cameraTargetGroupController.AddGimmickToTargetGroup(_gimmickObject.transform, 25f, -25f);
                _cameraTargetGroupController.AddGimmickToTargetGroup(_gimmickObject.transform, 1.5f, -10f);
                _targetGroup.AddMember(_gimmickObject.transform, 1.5f, 0.2f);
                Debug.Log("Add Target: " + _gimmickObject.name);
                _playerManager.DisableTeleport();
                break;
            }
        }
    }
}
```

### シナリオ制御

#### CSV データの読み込み、シナリオ表示

CSVデータを読み込みクラスで管理するスクリプトプランナーにCSV形式でシナリオを書いてもらうこうとでコードを書き換えなくてもシナリオを変更できるようにしました。

```csharp
/// <summary>
/// csvファイルを読み込んで、MessageDataクラスのリストに変換する
/// </summary>
public void LoodCSV()
{
    string[] linse = CsvFile.text.Split('\n', System.StringSplitOptions.RemoveEmptyEntries);

    for (int i = 0;  i < linse.Length; ++i)
    {
        if (string.IsNullOrWhiteSpace(linse[i])) continue;

        string[] values = linse[i].Split(',');

        MessageData data = new MessageData
        {
            Id = int.Parse(values[0]),
            CharacterName = values[1],
            MessageText = values[2],
            NextId = int.Parse(values[3])
        };
        message.Add(data);
    }
}

/// <summary>
/// 指定されたIDのCSVデータを取得
/// </summary>
/// <param name="id">取得するCSVデータのID</param>
/// <returns>指定されたIDのCSVデータ</returns>
public MessageData GetCSVText(int id)
{
    return message.FirstOrDefault(d => d.Id == id);
}
```

#### UI 表示　スプライトを Text で表示

シナリオによって背景やキャラクター名、コントローラーなどを表示とテキストの設定を変更するスクリプト各設定がしやすいように関数を複数に分け見やすいようにしました。

```csharp
/// <summary>
/// チュートリアル用コントローラーUIの表示
/// </summary>
/// <param name="data">シナリオデータ</param>
public void SetControllerUI(MessageData data)
{
    if (_messageBackImage.sprite == _messageBackImageList[0])
        SetCharacterUI(data);

    isControllerUI = false;

    // 特定の文字列があったらコントローラーUIを表示する
    foreach (var setting in _keywordSettings)
    {
        if (string.IsNullOrEmpty(setting.keyword)) continue;

        if (data.MessageText.Contains(setting.keyword))
        {
            if (_handImage != null)
            {
                _handImage.sprite = setting.nextSprite;
                Debug.Log($"コントローラーUI表示: {setting.keyword} に一致する画像を設定しました。");
                _toggle.UIControllerSprites.Add(setting.nextSprite);
            }
            _currentCanvasPos.anchoredPosition = _imageCanvasPos;

            isControllerUI = true;
        }
    }

    SetTextUI(isControllerUI);
}
```

---

## マリアーニ フランチェスコ パオロ

<div class="social-icons">
<a class="social-icon" target="_blank" href="https://github.com/Kiliken"><img src="img/github.svg" class="to-special-icon"></a>
<a class="social-icon" target="_blank" href="https://kiliken.github.io/index.html?lang=jp"><img src="img/website.svg" class="to-special-icon"></a>
<a class="social-icon" target="_blank" href="https://www.linkedin.com/in/francesco-paolo-mariani"><img src="img/linkedin.svg" class="to-special-icon"></a>
<a class="social-icon" target="_blank" href="https://www.wantedly.com/id/paolo_mariani"><img src="img/wantedly.svg" class="to-special-icon"></a>
</div><br>

### Switch用のビルド

#### クロスプラットフォーム・ラッパーの開発

複数人の開発チームに対して物理的なSDKライセンスが1つしか支給されないという制約に直面した際、チームの生産性を維持するための回避策を設計しました。Windows向けのJoyconLibライブラリを組み込み、独自のラッパーを開発したことで、チームはWindows上でシームレスな開発とテストを行いつつ、コードベースがNintendo Switchへのデプロイメントにも完全に対応した状態を維持することができました。


#### メンターシップ

テクニカルメンターとしてプロジェクトに参加し、コードレビューの実施や、ジュニアプログラマーへのベストプラクティスに関する指導を担当しました。また、最終的なビルドプロセスの監督を行い、Nintendo Switchのハードウェア上でゲームがスムーズに動作するよう、最適化基準やパフォーマンスのベストプラクティスが確実に遵守されるようにしました。

---

## 片山 奏

### 背景オブジェクト

#### 3Dオブジェクト演出

ステージ上のオブジェクトに動的な演出を作成しました。
背景オブジェクトの時計、飛行機、汽車等に、Mathf.Sin()を
利用した滑らかな上下運動を実装し、汽車の貨車には、オブジェクト
ごとにパラメータを変えることで、動きにタイミング差を作り、
波打つような表現を作成しました。

```csharp
public class TrainFloat : MonoBehaviour
{
	// ...
	
    private void Update()
    {
        // 上下にふよふよ
        float y =
            Mathf.Sin(Time.time * _floatSpeed) * _floatAmount;

        transform.localPosition =
            _startPosition + new Vector3(0f, y, 0f);
    }
}
```

```csharp
public class TrainCargoFloat : MonoBehaviour
{
	// ...
	
    private void Update()
    {
        float time =
            Time.time * _floatSpeed + _startOffset;

        float y =
            Mathf.Sin(time) * _floatAmount;

        transform.localPosition =
            _startPosition + new Vector3(0f, y, 0f);
    }
}
```

#### まとめ

今回のチーム制作を通して、Coroutineによるイベントシーケンス、
Transformを利用した3Dオブジェクト制御、UnityEventによる
処理の分離などを経験し、勉強しました。これら制作中に意識した
ことは、動けば完成ではなく、あとから調整しやすく、ほかのゲーム
オブジェクトから利用しやすい、構成にすることを意識しました。


### サブキャラクターレスキュー

#### ゲーム演出

サブキャラクター救出演出ではCoroutineを活用し、
複数のオブジェクト、カメラ、UI、アニメーションを
時間順に連携させるイベント処理を実装しました。

### メニューUI

#### メニュー画面



```csharp
```

```csharp
```

```csharp
```

選択状態に応じてUIを切り替え、選択時の拡大、通常UI、選択UIの切り替え、
UnityEventによる決定処理を実装し、入力をそのまま受け取るのではな、
_inputLockを使用して入力の連続反応を防止しました。
一つのスクリプトでUIの見た目を直接操作するのではなく、選択ロジックと
UI表示処理を分離して書きました。
メニューを開いている間は、Time.timeScale = 0f;を使用し、
ゲームを停止しています。ですが、メニューのアニメーションまで
止まってしまわないよう、time += Time.unscaledDeltaTime;
を使用しています。ゲーム停止中でもUIアニメーションを動作させるため、
通常の時間と、ゲームの時間を分けて設計しました。
全体の設計としては、UIの表示処理、入力処理、メニュー全体の制御を
役割ごとに分離し、状態に応じて操作対象を切り替えられるUIシステムを
設計、実装しました。

### メインゲームUI

#### メイン画面

GameUIManagerでは、ゲーム内の状態管理と、それに連動したUI演出を作成しました。
ゲーム中での所得情報をまとめて管理するクラスを制作しました。管理した要素は、
STAR,COIN,RESUCEです。星の所得数を管理し、３つすべてのSTARを取得した
タイミングでCOMPLETE演出を開始するようにし、RESUCUEでは、Coroutineを
利用し、救出、UI表示、一定時間待機、UI非表示という一連の流れを実装しました。


## 福島嘉紘

### ツインフロアギミック

#### TwinFloorManager.cs

```csharp
private void Awake()
{
    _children = new TwinFloorChild[_floorList.Count];


    _maxFloor = _floorList.Count;
    for(int i = 0; i < _maxFloor; i++)
    {
        _children[i] = _floorList[i].GetComponent<TwinFloorChild>();
    }

    RestFloor(0);
}
```


TwinFloorChild.csと組み合わせて床を踏むと
交互に次の床が出現するギミックを製作しました。
＊一部抜粋

#### TwinFloorChild.cs

```csharp
private void OnCollisionEnter(Collision collision)
{
    if(_floorType != FloorType.Both)
    {
        // 床のタイプとプレイヤーのタグが一致しなければ床を消す
        if (collision.gameObject.tag != _floorType.ToString())
        {
            SetFloorActive(false);
            return;
        }
    }


    //プレイヤー登録
    if (collision.gameObject.tag == "Player1")
    {
            _1p = collision.gameObject;
    }
    if(collision.gameObject.tag == "Player2")
    {
        _2p = collision.gameObject;
    }
    if(collision.gameObject.tag == "Player1" || collision.gameObject.tag == "Player2")
    {
        if(this.gameObject == _twinFloorManager._startFloor)
        {
            SetFloorActive(_twinFloorManager._floorList[0],true);
        }

        //ゴールについたら足場をすべて出す
        if (this.gameObject == _twinFloorManager._goalFloor)
        {
            _twinFloorManager._clear = true;
            foreach (GameObject _floor in _twinFloorManager._floorList)
            {
                SetFloorHitActive(_floor);        
            }
        }
    
        if (this.gameObject == _twinFloorManager._goalFloor || this.gameObject == _twinFloorManager._startFloor) return;
            // _twinFloorManager内のリストから自分は何番目か取得する
            _twinFloorManager.index =
            _twinFloorManager.
            _floorList.IndexOf( this.gameObject); 

        if(_twinFloorManager.index + 1 == _twinFloorManager._maxFloor)return;
        //一つ先の床を出す
        SetFloorActive(_twinFloorManager._floorList[_twinFloorManager.index + 1],true);
        SetFloorHitActive();
        _audioSource.PlayOneShot(_twinFloorManager._floorSE);
    }
}

private void OnCollisionExit(Collision collision)
{
    if(collision.gameObject.tag == "Player1")
    {
         _1p = null;
    }
    if(collision.gameObject.tag == "Player2")
    {
        _2p = null;
    }
    if(collision.gameObject.tag == "Player1" || collision.gameObject.tag == "Player2")
    {
        if(_1p == null && _2p == null)
        {
            Invoke(nameof(TwinFloorDelete), _twinFloorManager._deletTime);
            
        }
    }
    
        
        
}

void TwinFloorDelete()
{
    if (_twinFloorManager._clear) return;
    if (this.gameObject == _twinFloorManager._goalFloor || this.gameObject == _twinFloorManager._startFloor) return;
    // _deletTimeたってもプレイヤーがいなかったら床を消す
    if (_1p == null && _2p == null)
    {
        SetFloorActive(false);
    }
}
```

実際に床を出したり
一定時間非接触に
なったら不可視する
スクリプトです。


### タイトル

#### Return.cs

```csharp
/// <summary>
/// 戻るボタンを押した処理
/// </summary>
/// <param name="context">ボタン入力</param>
public void OnReturn(InputAction.CallbackContext context)
{
    if (!context.started) return;

    // 決定ボタンを押してないんだったら動かさない
    if (_titleButtonSelect._decided == false) return;
    _mainCamera.PlayOneShot(_returnAudio);
        _creditFade.FadeOut();
    if(_creditFade._isFade == false)
    {
        _titleButtonSelect._decided = false;
    }

        // アニメーションリセット
        _buttonAnimation.ResetAnimation();
        // アニメーション再開
        _buttonAnimation.RestartAnimation();
}
```

戻るボタンを押した時にフェードアウトして決定状態を
解除するスクリプトです。決定ボタンを押した後出ないと
処理が走らないようになっています。