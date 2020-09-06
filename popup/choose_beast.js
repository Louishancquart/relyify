/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = `body > :not(.beastify-image) {
                    display: none;
                  }`;

var data;
var pageUrl = window.location.href




/**
 * gather reviews with an Ajax call
 */
function loadReviews() {
  $.get("http://localhost:8080/reviews", function (data, status) {

    data[pageUrl].forEach(element => {
      $("#reviews-list").append(
        "<div class='review-result'>"
        + "<span><a>&uarr;</a></span>"
        + "<span>" + element.votes + "</span>"
        + "<span><a>&darr;</a></span>"
        + "<span><a href=" + element.referenceUrl + ">" + element.description + "</a></span>"
        + "</div>");
    });

  });
};



/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {

  document.addEventListener("click", (e) => {
    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     */
    function reset(tabs) {
      browser.tabs.removeCSS({ code: hidePage }).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

   

    if (e.target.classList.contains("reset")) {
      let addButton = document.getElementById("add-form");
      addButton.style.display = (addButton.style.display == "block" ? "none" : "block")
    }

    /**
     * Hide / Show form on click "Add"
     */
    if (e.target.id == "add") {
      document.getElementById("add-form").style.display = true;
    }

    /**
     * submit form 
     */
    if (e.target.id == "submit") {
      var formData = JSON.stringify({
        review: {
          videoId: pageUrl,
          type: $("#trustworthy").val() == "on",
          reviewedMediaUrl: pageUrl,
          referenceUrl: $("#referenceUrl").val(),
          description: $("#description").val(),
          votes: 0
        }
      });

      $.ajax({
        type: "POST",
        url: "http://localhost:8080/reviews",
        data: formData,
        error: function () { console.error(`Could not get reviews: ${error}`); },
        dataType: "json",
        contentType: "application/json"
      });
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({ file: "/content_scripts/beastify.js" })
  .then(loadReviews)
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
