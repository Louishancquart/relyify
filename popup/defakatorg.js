var data;
// var pageUrl = browser.tabs.ge/getCu
let pageUrl ;
// or the short variant
browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
  pageUrl = tabs[0].url; // Safe to assume there will only be one result
  console.log(tab.url);
}, console.error);


/**
 * gather reviews with an Ajax call
 */
function loadReviews() {
  $.get("http://localhost:8080/reviews", function (data, status) {

    data[pageUrl].forEach(element => {
      $("#reviews-list").append(
        "<div class='review-result'>"
        + "<span><a href='#'>&uarr;</a></span>"
        + "<span>" + element.votes + "</span>"
        + "<span><a href='#'>&darr;</a></span>"
        + "<span><a href=" + element.referenceUrl + " class='review-description'>" + element.description + "</a></span>"
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
     * send a "add" message to the content script in the active tab.
     */
    function addButton(tabs) {
      browser.tabs.removeCSS({ code: hidePage }).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "add",
        });
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not review this page: ${error}`);
    }



    if (e.target.classList.contains("add")) {
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
        success: function () {
          $("#submit-success").show();
          setTimeout(function () {
            $("#submit-success").hide();
            $("#add-form").hide()
            $("#reviews-list").empty()
            loadReviews()
          }, 1000); // timeout: 1s

        },
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
  console.error(`Failed to defakate content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({ file: "/content_scripts/defakate.js" })
  .then(loadReviews)
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
