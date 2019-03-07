
import sys
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.externals import joblib 
import pickle
from flask import Flask
from flask import jsonify, request, make_response, url_for, redirect
from flask import Response, json

app = Flask(__name__)


@app.route('/api/v1/fraud/detector', methods=['GET','POST'])
def api_all():
    if request.method == 'GET':
        return make_response('failure')
    if request.method == 'POST':
        var = main(request.json["age"], request.json["gender"], request.json["zipCustomer"], request.json["merchantID"], request.json["zipMerchant"], request.json["category"], request.json["amount"])
        if var ==0:
            return jsonify(isFraud = 0, status="Safe", TransactionMsg= "Good Transaction",
        Reason="Payee is safe")
        elif var == 1:
            return jsonify(isFraud = 1, status = "Fraud", TransactionMsg="Must be canceled",
        Reason= "Payee is fraud")


def myexp(x):
    ans = 1.0
    f = 1.0
    for n in range(20):
        f *= (n+1)
        ans += (x ** (n+1))/f
    return ans

def main(age, gender, zipCustomer, merchantID, zipMerchant, category, amount):
    c = [0.00117482452262270, -0.249764498793811, 0.0, 0.0, \
     -0.000201519712215039, -0.0386364934584626, 0.0227230543938356]
    s =  float(c[0])*float(age) + float(c[1])*float(gender) + \
        float(c[2])*float(zipCustomer) + float(c[3])*float(merchantID) + \
        float(c[4])*float(zipMerchant) + float(c[5])*float(category) + \
        float(c[6])*float(amount) 
    t = myexp(s)
    p = t/(1.0 + t)
    if p <= 0.5:
        return (0) # valid (= not fraud)
    else:
        return(1) # fraud

@app.route('/api/v1/document/detector', methods=['GET', 'POST'])
def api_doc():
    if request.method == 'GET':
        return make_response('failure')
    if request.method == 'POST':
        var = classify(request.json["data"])
        return jsonify(classification = var[0], probabilty=var[1])



def docmain(review_text):
    mr_text = []
    mr_text.append(review_text)

    # read the vectorizer and the model
    filenamevect = 'movie_review_vect.sav'
    vect = pickle.load(open(filenamevect, 'rb'))
    filenamemodel = 'movie_review_model.sav'
    clf = pickle.load(open(filenamemodel, 'rb'))

    x = vect.transform(mr_text)
    output_prob = clf.predict_proba(x)

    for p in output_prob:
        if p[1] >= p[0]:
            return(0)
        else:
            return(1)
def classify(news_text):
    test_text =[]
    test_text.append(news_text)
    
    # read the vectorizer and the model
    mlr_model = joblib.load("document_classify_model.sav")
    vect = joblib.load("document_classify_vect.sav") 
    
    x = vect.transform(test_text)
    output_prob = max(mlr_model.predict_proba(x))
    output_idx = mlr_model.predict(x) 
    Topics = ['Culture', 'Diverse','Economy','International_news','LocalNews', 
        'Politics','Society','Sports','Technology']
    output_array = [Topics[output_idx[0]],output_prob.max()]
  #  print("Topic: {} with probabilty={:.5f}".format(Topics[output_idx[0]],output_prob.max()))
    return(output_array)
# accept 7 features:
# age, gender, zipCustomer, merchantID, zipMerchant, category, amount
if __name__ == "__main__":
    app.debug = True
    app.run()


