function getContent(code) {
  return `
<!DOCTYPE html>
<head>
  <script src="${_global.url.babel}"></script>
</head>
<body>
  <div id="app"></div>
  <script src="//b.yzcdn.cn/show_me_the_code/dist/vendor_52e787ffc83ccee097a4.js"></script>
  <script src="${_global.resource.base}${_global.resource.run}"></script>
  <script type="text/babel" data-presets="es2015, es2017, stage-0">
    ${code}
  </script>
</body>
  `
}

export default getContent;
