

import pandas as pd

def fix_jurisdiction(juris):
    return juris.replace("(City)", "")
df = pd.read_html('report.xls')[0]
print(df.columns)
# print(df["Latitude"].notnull().sum())
# print(df["Longitude"].notnull())
df["Rescue Juristiction"] = df["Rescue Juristiction"].apply(fix_jurisdiction)



#produces a subset of the dataset that only has latitude elevation and longitude (just checking one value may suffice but why not check all)
cleaned_df =  df[ df["Latitude"].notnull() & df["Elevation"].notnull() & df["Longitude"].notnull()] 

#potentially provide address from latlong using google api? 



with pd.option_context("display.max_rows", None, "display.max_columns", None):
    print(cleaned_df)