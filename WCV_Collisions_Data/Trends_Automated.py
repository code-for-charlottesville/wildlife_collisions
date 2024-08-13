import pandas as pd

df = pd.read_csv('WCV_Collisions_Data\WCV Collision Data Mod.csv')

#Yearly Trends

year_dict = dict()
months_dict = {"January": 0,
               "February": 0,
               "March": 0,
               "April": 0,
               "May": 0,
               "June": 0,
               "July": 0,
               "August": 0,
               "September": 0,
               "October": 0,
               "November": 0,
               "December": 0}
jurisdiction_counts = dict()
species_counts = dict()

for index, row in df.iterrows():
    if row["DDateAdmittedYear"] in year_dict:
        year_dict[int(row["DDateAdmittedYear"])] += 1
    else:
        year_dict[int(row["DDateAdmittedYear"])] = 1
    
    months_dict[row["DDateAdmittedYear"]] += 1

    if row["RescueJurisdiction"] in jurisdiction_counts:
        jurisdiction_counts[row["RescueJurisdiction"]] += 1
    else:
        jurisdiction_counts[row["RescueJurisdiction"]] = 1

    if row["CommonSpeciesName"] in species_counts:
        species_counts[row["CommonSpeciesName"]] += 1
    else:
        species_counts[row["CommonSpeciesName"]] = 1

species_counts_list = list()
for species in species_counts:
    species_counts_list.append((species_counts[species], species))

species_counts_list = sorted(species_counts_list)
