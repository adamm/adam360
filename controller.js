

exports.get_index = function (req, res) {
    res.setHeader('Cache-Control','no-cache, no-store, max-age=0, must-revalidate');
    if (typeof req.session.page == 'undefined')
        req.session.page = 0;

    let tmpl = {
        page:req.session.page,
        textList: [],
        questionList: [],
        questionIds: ""
    };

    console.log(req.session.page);

    if (req.session.page <= 0) {
        tmpl.title = "Welcome";
        tmpl.textList = ['Thank you for participating in Adam\'s 360 review.  Please provide frank responses to this brief questionnaire.'];
        tmpl.startPage = 1;
    }
    else if (req.session.page >= 1 && req.session.page <= 4) {
        tmpl.title = `Page ${req.session.page} of 4:`;
        return show_questions(req, res, tmpl, req.session.page);
    }
    else {
        tmpl.title = "Thank you!";
        tmpl.textList = ['Thank you for participating in this review.  If you want to change any of your answers, press the button below.'];
        tmpl.lastPage = 1;
    }
    return res.render("index", tmpl);
}


exports.post_index = function (req, res) {
    let nav = req.param('nav');
    
    if (req.param('questionIds') && req.param('questionIds') != "") {
        let questionIds = req.param('questionIds').split(',');
        let sqlList = [], argList = [];
        questionIds.forEach(questionResponseId => {
            let questionId = null, responseId = null;
            [questionId, responseId] = questionResponseId.split('_');
            let answer = req.param('question_' + questionResponseId);

            if (responseId == '' && typeof answer != "undefined" && answer != "") {
                sqlList.push('insert into responses (session_id, question_id, text, datetime) values (?, ?, ?, now())');
                argList.push([req.session.id, questionId, answer]);
            }
            else if (responseId != '' && typeof answer != "undefined" && answer != "") {
                sqlList.push('update responses set text = ?, datetime = now() where session_id = ? and question_id = ? and id = ?');
                argList.push([answer, req.session.id, questionId, responseId]);
            }
            else if (responseId != '') {
                sqlList.push('delete from responses where session_id = ? and question_id = ? and id = ?');
                argList.push([req.session.id, questionId, responseId]);
            }
        });
        for (var i = 0; i < sqlList.length; i++) {
            console.log(sqlList[i], '!!', argList[i]);
            res.locals.db.query(sqlList[i], argList[i]);
        }
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


function show_questions (req, res, tmpl, page) {
    res.locals.db.query(`select q.id, q.text, q.type, r.id as response_id, r.text as response_text from questions q left join responses r on r.question_id = q.id and r.session_id = ? where page = ? order by id`, [req.session.id, page])
        .then(rows => {
            let questionIdList = [];
            rows.forEach(row => {
                if (row.response_id == null)
                    row.response_id = '';
                tmpl.questionList.push(row);
                questionIdList.push(row.id+'_'+row.response_id);
            });
            tmpl.questionIds = questionIdList.join(',');
            return res.render("index", tmpl);
        }).catch(err => {
            console.error(err);
            return res.sendStatus(500);
        });
}