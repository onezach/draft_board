from flask import Flask, request, jsonify
from flask_cors import cross_origin

import json
import csv
import datetime

last_save = {}

app = Flask(__name__)


@app.route("/", methods=['POST', 'GET'])
@cross_origin()
def base():
    response = jsonify(message="Server active")
    return response


@app.route("/save", methods=['POST'])
@cross_origin()
def save():
    
    try:
        data = request.get_json()
        with open(f"last_save.json", mode="w") as json_file:
            json.dump(data, json_file)
            last_save.update(data)
        return jsonify(message="Save successful")

    except:
        return jsonify(message="Save unsuccessful")


@app.route("/import", methods=['GET'])
@cross_origin()
def import_last_save():
    try:
        with open(f"last_save.json", mode="r") as json_file:
            last_save = json.load(json_file)
            return last_save
    except:
        last_save['picks'] = []
        return last_save


@app.route("/export", methods=['POST'])
@cross_origin()
def export():
    try:
        body = request.get_json()
        month = datetime.datetime.now().month
        day = datetime.datetime.now().day
        year = datetime.datetime.now().year
        with open(f"results_{month}{day}{year}.json", mode="w") as jsonfile:
            # writer = csv.writer(csvfile)
            json.dump(last_save, jsonfile)
            # writer.writerows(body['data'])
            # for team in body['data']:
            #     team_picks = []
            #     for round in team:
            #         team_picks.append(f"{round['data']['position']} {round['data']['firstName']} {round['data']['lastName']}")
            #     writer.writerow(team_picks)
    except:
        return jsonify(message="Failed to export", status=False)
    return jsonify(message="Export successful", status=True)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000) 
