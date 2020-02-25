var info = document.getElementById("info");

var relyify = document.createElement("div");
relyify.id ="relyify";
relyify.innerHTML = "<div style=\"background:red;height:25px;width:100%\">" +
    "<span>&uarr;</span>"+
    "<span>123</span>"+
    "<span>|</span>"+
    "<span>My document title</span>"+
    "<span><em>+</em></span>"+
    "</div>";


info.insertBefore( relyify,info);


