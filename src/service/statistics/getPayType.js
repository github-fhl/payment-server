const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  _ = require('lodash');

module.exports = async () => {
  let payTypes = await getPayType();
  let subjects = await getSubjects(payTypes);
  return formatResults(payTypes, subjects);
}

let getPayType = async () => {
  return await models.paytype.findAll({
    attributes: ['id', 'subjectId'],
    include: [{
      model: models.paytypedetail, attributes: ['id', 'subjectId']
    }]
  })
}

let getSubjects = async (payTypes) => {
  let uniqSubjectIdArray = [];
  payTypes.forEach(payType => {
    uniqSubjectIdArray.push(payType.subjectId);
    payType.paytypedetails.forEach(paytypedetail => {
      uniqSubjectIdArray.push(paytypedetail.subjectId);
    })
  })
  uniqSubjectIdArray = _.uniq(uniqSubjectIdArray);
  return await models.subject.findAll({where: {id: {$in: uniqSubjectIdArray}}, attributes: ['id', 'code']});
}

let formatResults = (payTypes, subjects) => {
  let payTypeArray = [];
  let subjectCode;
  payTypes.forEach(payType => {
    subjectCode = getSubjectCode(payType.subjectId, subjects);
    payTypeArray.push(subjectCode ? payType.id + `, ${subjectCode}` : payType.id);
    payType.paytypedetails.forEach(paytypedetail => {
      subjectCode = getSubjectCode(paytypedetail.subjectId, subjects);
      payTypeArray.push(subjectCode ? paytypedetail.id + `, ${subjectCode}` : paytypedetail.id);
    })
  })
  return payTypeArray;
}

let getSubjectCode = (subjectId, subjects) => {
  let code;
  subjects.forEach(subject => {
    if (subject.id === subjectId) {
      code = subject.code;
    }
  })
  if (code) {
    return code
  }
  return null;
}