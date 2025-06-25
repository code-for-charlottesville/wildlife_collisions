import pandas as pd
from pytaxize import ncbi
import os
import time
import datetime

# Import the wcv collision data csv file into a dataframe
df = pd.read_csv('WCV_Collisions_Data\WCV Collision Data.csv')
mapper_df = pd.read_csv('WCV_Collisions_Data\RevisedCollisionAnimalMapping.csv')
count = 0

os.environ['ENTREZ_KEY'] = 'ba09124ac9a6c5988ee63017a02ee60dab08'

# Check that the data is all from VA and that there is only one reason for rescue
assert len(df['Circumstances of Rescue'].unique()) == 1
assert len(df['Rescue State'].unique()) == 1

# Get all unique values for Rescue Juristiction and sort them in alphabetical order, visually inspect the list
juristicions = df['Rescue Juristiction'].unique()
juristicions.sort()
# print(juristicions)

# 1) go through CollisionsAnimals csv file and read and transfer all animal names and Classification into dictionary with this format --> animal name: classification (all lowercase animal names)

animal_mapping = dict()

# for index, row in mapper_df.iterrows():
#     common_species_name = row["Animal"].lower()
#     general_name = row["Mapping"].lower()
#     animal_mapping[common_species_name] = general_name

for index, row in mapper_df.iterrows():
    common_species_name = row["CommonSpeciesName"].lower()
    general_name = row["CommonDesc"].lower()
    animal_mapping[common_species_name] = general_name


def date_admitted_year(row):
    date = row['DateAdmitted'].strip().split('/')
    return date[2]

def date_admitted_month_name(row):
    date = row['DateAdmitted'].strip().split('/')
    return months_num_to_name[date[0]]

def date_admitted_month_number(row):
    date = row['DateAdmitted'].strip().split('/')
    return date[0]

def date_admitted_day(row):
    date = row['DateAdmitted'].strip().split('/')
    return date[1]

def days_of_week(row):
    dates_to_weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    date = row['DateAdmitted'].strip().split('/')
    day_num = datetime.date(year=int(date[2]), month=int(date[0]), day=int(date[1])).weekday()
    return dates_to_weekday[day_num]

def find_season(row):
    '''
    Winter: December 22 - March 20
    Spring: March 21 - June 20
    Summer: June 21 - September 22
    Autumn: September 23 - December 21
    '''
    date = row['DateAdmitted'].strip().split('/')
    day = int(date[1])
    month = int(date[0])
    # print("Month: ", month)
    if month == 1 or month == 2:
        return "Winter"
    elif month == 4 or month == 5:
        return "Spring"
    elif month == 7 or month == 8:
        return "Summer"
    elif month == 10 or month == 11:
        return "Autumn"
    elif month == 3:
        if day <= 20:
            return "Winter"
        else:
            return "Spring"
    elif month == 6:
        if day <= 20:
            return "Spring"
        else:
            return "Summer"
    elif month == 9:
        if day <= 22:
            return "Summer"
        else:
            return "Autumn"
    elif month == 12:
        if day <= 21:
            return "Autumn"
        else:
            return "Winter"
    return "NA"

def truncate_elevation(row):
    return int(row['Elevation'])

def format_species_name(row):
    formatted_name = " ".join(word.capitalize() for word in row['CommonSpeciesName'].split())
    return formatted_name

# def find_city(row):
#     address = row["RescueAddress"]
#     address_list = address.split(",")
#     city = address_list[]

def broad_category(row):
    global count
    species_name = row["CommonSpeciesName"].lower()
    last_word = species_name.strip().split()[-1].lower()
    if species_name in animal_mapping:
        return animal_mapping[species_name]
    ###### backup ######
    else:
        if count >= 3:
            time.sleep(1.5)
            count = 0
        result = ncbi.search(sci_com = species_name)
        if len(result[species_name]) > 0:
            count += 1
            division = result[species_name][0]['Division'].lower()
            if division == 'carnivores':
                animal_mapping[species_name] = last_word
                return last_word
            elif division == 'birds' or division == 'hawks & eagles' or last_word == 'owl':
                animal_mapping[species_name] = "bird"
                return "bird" 
            else:
                animal_mapping[species_name] = division
                return division 
        else:
            count += 1
            animal_mapping[species_name] = last_word
            return last_word

def update_disposition(row):
    disposition = row["Disposition"].lower()
    if disposition == 'euthanized':
        return 'Died'
    if disposition == 'self-released':
        return 'Released'
    return " ".join(w.capitalize() for w in disposition.split())

# drop any duplicate rows
df.drop_duplicates(inplace=True)

# fix spelling of jurisdiction column name

df.rename(columns={'Rescue Juristiction': 'Rescue Jurisdiction'}, inplace=True) 

# remove spaces from all column names

for col_name in df.columns:
    new_col_name = "".join(word.capitalize() for word in str(col_name).split())
    df.rename(columns={str(col_name): new_col_name}, inplace=True)

# Adding extra columns
# Question: should I keep number for month or should I convert to the name of the month 

months_num_to_name = {'1':'January', 
                      '2':'February', 
                      '3':'March', 
                      '4':'April', 
                      '5':'May', 
                      '6':'June', 
                      '7':'July', 
                      '8':'August', 
                      '9':'September', 
                      '10':'October', 
                      '11':'November', 
                      '12':'December'}

df['DDateAdmittedYear'] = df.apply(date_admitted_year, axis=1)
df['DDateAdmittedMonthName'] = df.apply(date_admitted_month_name, axis=1)
df['DDateAdmittedMonthNumber'] = df.apply(date_admitted_month_number, axis=1)
df['DDateAdmittedDay'] = df.apply(date_admitted_day, axis=1)
df['DaysOfWeek'] = df.apply(days_of_week, axis=1)
df['Season'] = df.apply(find_season, axis=1)
df['UpdatedDisposition'] = df.apply(update_disposition, axis=1)

# For now, dropping any rows with missing Latitude or Longitude data
# Need to address case where there is Lat, Long data but not Elevation data for when trying to truncate

df.dropna(axis=0, inplace=True, subset=['Latitude', 'Longitude'])

# truncate decimals for elevation column (just making it an integer), might delete entire column

df['Elevation'] = df.apply(truncate_elevation, axis=1)

# formatting species names

df['CommonSpeciesName'] = df.apply(format_species_name, axis=1)

# general species category

# if we want to delete the Elevations column completely

'''df.drop(['Elevation'], axis=1, inplace=True)'''

common_names_list = df['CommonSpeciesName'].unique()

# 2) go through each row in the collision data csv and see if species is already there

df['GeneralSpeciesName'] = df.apply(broad_category, axis=1)

# result = ncbi.search(sci_com = "barred owl")
# print(result)
# animal_type = result["coastal plain cooter"][0]['Division'].lower()

# 3) put all mappings back into csv from animal mapping dictionary

new_animal_mapping = pd.DataFrame(columns=['Animal', 'Mapping'])

for mapping in animal_mapping:
    row = {'Animal':mapping, 'Mapping':animal_mapping[mapping]}
    new_animal_mapping.loc[len(new_animal_mapping)] = row

new_animal_mapping.to_csv("WCV_Collisions_Data\RevisedCollisionAnimalMapping.csv", sep=',', encoding='utf-8', index=False, header=True)

df.to_csv("WCV_Collisions_Data\WCV Collision Data Mod.csv", sep=',', encoding='utf-8', index=False, header=True)