"use strict";


// Github links

var github_repository = "https://github.com/hawkrobe/probLang-memo/";

function markdown_url(page_url) {
    return page_url.slice(0, -4) + "md";
}

function github_edit_url(page_url) {
    return github_repository + "edit/main" + markdown_url(page_url);
}

function github_page_url(page_url) {
    if ((page_url == "/index.html") || (page_url == "/")) {
        return github_repository + "blob/main/chapters";
    } else {
        return github_repository + "blob/main" + markdown_url(page_url);
    };
}


// WebPPL functionality removed - now using ThebeLab for interactive code


// References and bibliography

var textohtml_map = {
  "\\\"u": "&uuml;",
  "\\\"a": "&auml;",
  "\\\"o": "&ouml;",
  "\\'e": "&eacute;",
  "\\\"U": "&Uuml;",
  "\\\"A": "&Auml;",
  "\\\"O": "&Ouml;",
  "\\'E": "&Eacute;",
  "\\\"{u}": "&uuml;",
  "\\\"{a}": "&auml;",
  "\\\"{o}": "&ouml;",
  "\\'{e}": "&eacute;",
  "\\\"{U}": "&Uuml;",
  "\\\"{A}": "&Auml;",
  "\\\"{O}": "&Ouml;",
  "\\'{E}": "&Eacute;"
};

function textohtml(tex) {
    for (var key in textohtml_map) {
        if (textohtml_map.hasOwnProperty(key)) {
            tex = tex.replace("{" + key + "}", textohtml_map[key]);
            tex = tex.replace(key, textohtml_map[key]);
        };
    };
    return tex;
}

function replace_html(source, target) {
    $('p, li').each(function () {
        var html = $(this).html();
        $(this).html(html.replace(new RegExp(source, "ig"), target));
    });
}

function format_citation(citation) {
    var s = "";
    if (citation["URL"]) {
        s += "<a href='" + citation["URL"] + "'>" + citation["TITLE"] + "</a>. ";
    } else {
        s += citation["TITLE"] + ". ";
    };
    s += citation["AUTHOR"] + " (" + citation["YEAR"] + ").";
    if (citation["JOURNAL"]) {
        s += " <em>" + citation["JOURNAL"] + "</em>.";
    }
    return textohtml(s);
}

function author_lastname(authorString) {
  var names = authorString.split(", ");
  if (names.length == 0) {
    console.error('Expected first and last name, got: ' + authorString);
    return;
  }
  return names[0];
}

function short_authors(authorsString) {
  if (!authorsString) {
    console.warn('short_authors got undefined or empty author string');
    return 'Unknown Author';
  }
  var authors = authorsString.split(" and ");
  if (authors.length === 0) {
    console.error('Expected >= 1 author, got: ' + authorsString);
    return 'Unknown Author';
  }
  var firstAuthor = authors[0];
  if (authors.length === 1) {
    return author_lastname(firstAuthor);
  } else if (authors.length === 2) {
    var secondAuthor = authors[1];
    return author_lastname(firstAuthor) + ' and ' + author_lastname(secondAuthor);
  } else {
    return author_lastname(firstAuthor) + ' et al.';
  }
}

function cite_url(citation) {
  if (citation["URL"]) {
    return citation["URL"];
  }
  return 'https://scholar.google.com/scholar?q="' + citation["TITLE"] + '"';
}

function format_reft(citation) {
  var s = "";
  s += "<a class='ref' href='" + cite_url(citation) + "'>";
  s += short_authors(citation["AUTHOR"]) + " (" + citation["YEAR"] + ")";
  s += "</a>";
  return textohtml(s);
}

function format_refp(citation) {
  var s = "(";
  s += "<a class='ref' href='" + cite_url(citation) + "'>";
  s += short_authors(citation["AUTHOR"]) + ", " + citation["YEAR"];
  s += "</a>";
  s += ")";
  return textohtml(s);
}


$.get("/probLang-memo/bibliography.bib", function (bibtext) {
    $(function () {
        var bibs = doParse(bibtext);
        $.each(
            bibs,
            function (citation_id, citation) {
              // Skip if citation_id starts with @ or if citation is invalid
              if (citation_id.startsWith('@') || !citation || !citation["AUTHOR"]) {
                return;
              }
              replace_html("cite:" + citation_id, format_citation(citation));
              replace_html("reft:" + citation_id, format_reft(citation));
              replace_html("refp:" + citation_id, format_refp(citation));
            }
        );
    });
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Failed to load bibliography:', textStatus, errorThrown);
});


// LaTeX math
// based on https://github.com/cben/sandbox/blob/gh-pages/_layouts/katex.html

$(function(){
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    /* TODO: keep going after an individual parse error. */
    var script = scripts[i];
    if (script.type.match(/^math\/tex/)) {
      var text = script.text === "" ? script.innerHTML : script.text;
      var options = script.type.match(/mode\s*=\s*display/) ?
          {displayMode: true} : {};
      script.insertAdjacentHTML("beforebegin",
                                katex.renderToString(text, options));
    }
  }
  document.body.className += " math_finished";
});


// Date

function setDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
  $(".date").text(yyyy+'-'+mm+'-'+dd);
}

// Analytics

(function(i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function() {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
  m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-54996-16', 'auto');
ga('send', 'pageview');


// On page load

$(document).ready(function() {
  setDate();
});
