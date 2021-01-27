var THREEx = THREEx || {}

THREEx.ArPatternFile = {}

THREEx.ArPatternFile.toCanvas = function(patternFileString, onComplete){
	console.assert(false, 'not yet implemented')
}

//////////////////////////////////////////////////////////////////////////////
//		画像をエンコードする関数
//////////////////////////////////////////////////////////////////////////////

THREEx.ArPatternFile.encodeImageURL = function(imageURL, onComplete){
	//新しい画像を宣言
	var image = new Image;
	//画像が読み込まれたとき
	image.onload = function(){
		var patternFileString = THREEx.ArPatternFile.encodeImage(image)
		onComplete(patternFileString)
	}
	image.src = imageURL;
}

THREEx.ArPatternFile.encodeImage = function(image){
	// キャンバス要素の作成
	var canvas = document.createElement('canvas');
	// 二次元グラフィックスのコンテキストを取得
	var context = canvas.getContext('2d')
	//キャンバスの大きさを16x16に指定
	canvas.width = 16;
	canvas.height = 16;

	// document.body.appendChild(canvas)
	// canvas.style.width = '200px'

	//文字列の宣言
	var patternFileString = ''
	for(var orientation = 0; orientation > -2*Math.PI; orientation -= Math.PI/2){
		// draw on canvas - honor orientation
		//描写状態を保存する
		context.save();
		//キャンバスの大きさの四角形を用意
 		context.clearRect(0,0,canvas.width,canvas.height);
		//キャンバスの中心位置に移動
		context.translate(canvas.width/2,canvas.height/2);
		//回転させる
		context.rotate(orientation);
		//画像を描写する
		context.drawImage(image, -canvas.width/2,-canvas.height/2, canvas.width, canvas.height);
		//変更状態を元に戻す
		context.restore();

		// 画像情報の取得
		var imageData = context.getImageData(0, 0, canvas.width, canvas.height)

		// 最初のループでない場合、改行を加える
		if( orientation !== 0 )	patternFileString += '\n'
		// NOTE rgbではなくbgrの順序!!! 2から0まで
		for(var channelOffset = 2; channelOffset >= 0; channelOffset--){
			//イメージの高さ分、繰り返す
			for(var y = 0; y < imageData.height; y++){
				//イメージの長さ分、繰り返す
				for(var x = 0; x < imageData.width; x++){

					if( x !== 0 ) patternFileString += ' '

					var offset = (y*imageData.width*4) + (x * 4) + channelOffset
					var value = imageData.data[offset]

					patternFileString += String(value).padStart(3);
				}
				patternFileString += '\n'
			}
		}
	}

	return patternFileString
}

//////////////////////////////////////////////////////////////////////////////
//		trigger download
//////////////////////////////////////////////////////////////////////////////

THREEx.ArPatternFile.triggerDownload =  function(patternFileString, fileName = 'pattern-marker.patt'){
	// tech from https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
	var domElement = window.document.createElement('a');
	domElement.href = window.URL.createObjectURL(new Blob([patternFileString], {type: 'text/plain'}));
	domElement.download = fileName;
	document.body.appendChild(domElement)
	domElement.click();
	document.body.removeChild(domElement)
}

THREEx.ArPatternFile.buildFullMarker =  function(innerImageURL, pattRatio, size, color, onComplete){
	// 白枠の大きさ設定
	var whiteMargin = 0.1
	// 黒枠の大きさを計算する
	var blackMargin = (1 - 2 * whiteMargin) * ((1-pattRatio)/2)
	// var blackMargin = 0.2

	// 白枠と黒枠の合計
	var innerMargin = whiteMargin + blackMargin

	//キャンバスの作成
	var canvas = document.createElement('canvas');
	//キャンバスの2Dを取得
	var context = canvas.getContext('2d')
	//設定した大きさのキャンバスを作成
	canvas.width = canvas.height = size

	// 塗り色を白に指定
	context.fillStyle = 'white';
	// キャンバス領域すべてを白色に塗りつぶし
	context.fillRect(0,0,canvas.width, canvas.height)

	// 白枠の内側に指定した色枠を作成
	context.fillStyle = color;
	context.fillRect(
		whiteMargin * canvas.width,
		whiteMargin * canvas.height,
		canvas.width * (1-2*whiteMargin),
		canvas.height * (1-2*whiteMargin)
	);

	// 画像表示領域を白色で初期化
	context.fillStyle = 'white';
	context.fillRect(
		innerMargin * canvas.width,
		innerMargin * canvas.height,
		canvas.width * (1-2*innerMargin),
		canvas.height * (1-2*innerMargin)
	);


	// 画像を描写する
	var innerImage = document.createElement('img')
	innerImage.addEventListener('load', function(){
		// draw innerImage
		context.drawImage(innerImage,
			innerMargin * canvas.width,
			innerMargin * canvas.height,
			canvas.width * (1-2*innerMargin),
			canvas.height * (1-2*innerMargin)
		);

		var imageUrl = canvas.toDataURL()
		//変換する
		onComplete(imageUrl)
	})
	innerImage.src = innerImageURL
}
