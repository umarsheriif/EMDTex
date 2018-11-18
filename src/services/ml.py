
import sys
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
from flask import Flask
from flask import jsonify, request, make_response, url_for, redirect
from flask import Response, json

app = Flask(__name__)
# Create some test data for our catalog in the form of a list of dictionaries.


@app.route('/api/v1/document/detector', methods=['GET', 'POST'])
def api_all():
    if request.method == 'GET':
        return make_response('failure')
    if request.method == 'POST':
        var = main(request.json["data"])
        if var == 0:
            return jsonify(Movie="GoodMovie")
        elif var == 1:
            return jsonify(Movie="BadMovie")


def main(review_text):
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


# accept 7 features:
# age, gender, zipCustomer, merchantID, zipMerchant, category, amount
if __name__ == "__main__":
    app.debug = True
    app.run()
