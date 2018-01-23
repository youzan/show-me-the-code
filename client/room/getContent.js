function getContent(code) {
  return `
<!DOCTYPE html>
<head>
  <script src="${_global.url.babel}"></script>
  <style>
  body {
    width: 100vw;
    height: 100vh;
    margin: 0;
  }
  
  .console {
    color: #ccc;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 10px;
    box-sizing: border-box;
  }
  </style>
</head>
<body>
  <div id="app"></div>
  <script src="//b.yzcdn.cn/show_me_the_code/dist/vendor_52e787ffc83ccee097a4.js"></script>
  <script src="${_global.resource.base}${_global.resource.run}"></script>
</body>
  `
}

export default getContent;
