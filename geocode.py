import pandas as pd

import requests 
import json

session = requests.Session()


def get_addr(lat, lon):

    base = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
    req = requests.Request("GET", base, headers= {
        #no shot this actually worked 
        "User-Agent":"Please :3"
    })
    #check the request body
    # print(req.prepare().body)

    #prep and send the login request
    prepped = session.prepare_request(req)
    r = session.send(prepped, verify=True)
    
    return r.json()["display_name"]



df = pd.read_html('report.xls')[0]
print(df.columns)
df = df.head(3)
cleaned_df =  df[ df["Latitude"].notnull() & df["Elevation"].notnull() & df["Longitude"].notnull()] 
li = [] 
for index, row in cleaned_df.iterrows():
    # print(index)
    if(row["Rescue Address"] == "nan"):
        print(row["Rescue Address"])
        continue
    li.append([index, get_addr(row["Latitude"], row["Longitude"])])
print(li)


