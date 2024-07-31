#some really janky code trying to get access to the site programatically 
import requests


#webhook url for testing request data
test_url = "https://webhook.site/492da7eb-2e8e-4169-976d-54e31724a835"

#the request we make when we try and grab data from the data query on the site
data_url = "https://records.wild-one.org/?action=report.customBuilderStep4"

#login url
login_url = "https://records.wild-one.org/?action=security.login"

session = requests.Session()
# login_url = test_url
req = requests.Request("POST", login_url, 
                       files = {
                           "email":(None, "visitor@wildlifecenter.org"),
                           "password":(None, "visitor")
                           },
                    )
#check the request body
# print(req.prepare().body)

#prep and send the login request
prepped = session.prepare_request(req)
r = session.send(prepped, verify=True)
# print(r.content)


# url = test_url
req = requests.Request("POST", data_url, 
                    data={"runReportID":"1700"},
    headers={
        "Content-Type":"application/json",
            
            }
)

#prep and send the data request
prepped = session.prepare_request(req)
r = session.send(prepped, verify=True)
print(r.headers)