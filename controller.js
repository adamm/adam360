

exports.get_index = function (req, res) {
    res.setHeader('Cache-Control','no-cache, no-store, max-age=0, must-revalidate');
    if (typeof req.session.page == 'undefined')
        req.session.page = 0;

    let locals = {
        page:req.session.page,
        textList: [],
        questionList: [],
        answerIdList: [],
    };

    if (req.session.page == 0) {
        locals.title = "Welcome";
        locals.textList = ['Thank you for participating in Adam\'s 360 review.  Please provide frank responses to this brief questionnaire.'];
    }
    else if (req.session.page == 1) {
        locals.title = "What do you think?";
        locals.questionList.push({
            id: 1,
            text: "How rapid is rapid?",
            type: 'closed'
        });
        locals.answerIdList = [1];
    }
    else if (req.session.page == 2) {
        locals.title = "A little more detail?";
        locals.questionList.push({
            id: 2,
            text: "Where do I go from here?",
            type: 'open'
        });
        locals.answerIdList = [2];
    }
    else {
        locals.title = "Thank you!";
        locals.textList = ['Thank you for participating in this review.  If you want to change any of your answers, press the button below.'];
        locals.lastPage = 1;
    }

    locals.answerIds = locals.answerIdList.join(',');
    res.render("index", locals);
}


exports.post_index = function (req, res) {
    let nav = req.param('nav');
    
    if (req.param('answerIds') && req.param('answerIds') != "") {
        let answerIds = req.param('answerIds').split(',');
        answerIds.forEach(answerID => {
            console.log(answerID, req.param('answer_' + answerID));
        });
    }

    if (nav == 'next') {
        req.session.page++;
    }
    else if (nav = 'prev') {
        req.session.page--;
    }
    req.session.save(err => {
        if (err)
            console.error(err);
        res.redirect(req.headers.referer || '/');
    });
}