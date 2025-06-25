import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv('WCV_Collisions_Data\WCV Collision Data Mod.csv')

# Seasonal Trends

animal_counts = dict()
monthly_time_series = dict()

for index, row in df.iterrows():
    common_species_name = row["CommonSpeciesName"].lower()
    season = row["Season"].lower()
    if season in animal_counts:
        if common_species_name in animal_counts[season]:
            animal_counts[season][common_species_name] += 1
        else:
            animal_counts[season][common_species_name] = 1
    else:
        animal_counts[season] = dict()
        animal_counts[season][common_species_name] = 1

for season in animal_counts:

    animal_frequency = list()
    animal_labels = list()
    total_animals = sum(animal_counts[season].values())
    total_others = 0

    for animal in animal_counts[season]:
        if animal_counts[season][animal]/total_animals >= 0.025:
            animal_frequency.append(animal_counts[season][animal])
            animal_labels.append(animal.title())
            if animal not in monthly_time_series:
                monthly_time_series[animal] = [0,0,0,0,0,0,0,0,0,0,0,0]
        else:
            total_others += animal_counts[season][animal]
    
    animal_frequency.append(total_others)
    animal_labels.append("Others")

    plt.pie(animal_frequency, labels = animal_labels, autopct = '%1.1f%%')
    plt.title(season.title())
    plt.show()

##### monthly time series #####

for index, row in df.iterrows():
    common_species_name = row["CommonSpeciesName"].lower()
    month = row["DDateAdmittedMonthNumber"]
    if common_species_name in monthly_time_series:
        monthly_time_series[common_species_name][month-1] += 1

monthly_data = {'Month':['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}

for animal in monthly_time_series:
    monthly_data[animal.title()] = monthly_time_series[animal]

df_month_time_series = pd.DataFrame(monthly_data)
df_month_time_series = df_month_time_series.set_index("Month")

for column in df_month_time_series.columns:
    plt.plot(df_month_time_series.index, df_month_time_series[column], label=column)
plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
plt.tight_layout()
plt.show()

##### seasonal time series #####

seasonal_time_series = monthly_time_series.copy()

season_to_number_mapping = {
    'Summer': 0,
    'Autumn': 1,
    'Winter': 2,
    'Spring' : 3
}
for animal in seasonal_time_series:
    seasonal_time_series[animal] = [0,0,0,0]

for index, row in df.iterrows():
    common_species_name = row["CommonSpeciesName"].lower()
    season = row["Season"]
    if common_species_name in seasonal_time_series:
        seasonal_time_series[common_species_name][season_to_number_mapping[season]] += 1

seasonal_data = {'Season':['Summer', 'Autumn', 'Winter', 'Spring']}

for animal in seasonal_time_series:
    seasonal_data[animal.title()] = seasonal_time_series[animal]

df_season_time_series = pd.DataFrame(seasonal_data)
df_season_time_series = df_season_time_series.set_index("Season")

for column in df_season_time_series.columns:
    plt.plot(df_season_time_series.index, df_season_time_series[column], label=column)
plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
plt.tight_layout()
plt.show()

# summer_animal_counts = dict()
# winter_animal_counts = dict()
# autumn_animal_counts = dict()
# spring_animal_counts = dict()

# for index, row in df.iterrows():
#     common_species_name = row["CommonSpeciesName"].lower()
#     season = row["Season"].lower()

#     if season == "summer":
#         if common_species_name in summer_animal_counts:
#             summer_animal_counts[common_species_name] += 1
#         else:
#             summer_animal_counts[common_species_name] = 1

#     if season == "winter":
#         if common_species_name in winter_animal_counts:
#             winter_animal_counts[common_species_name] += 1
#         else:
#             winter_animal_counts[common_species_name] = 1

#     if season == "spring":
#         if common_species_name in spring_animal_counts:
#             spring_animal_counts[common_species_name] += 1
#         else:
#             spring_animal_counts[common_species_name] = 1

#     if season == "autumn":
#         if common_species_name in autumn_animal_counts:
#             autumn_animal_counts[common_species_name] += 1
#         else:
#             autumn_animal_counts[common_species_name] = 1

# summer_animal_frequency = list()
# winter_animal_frequency = list()
# autumn_animal_frequency = list()
# spring_animal_frequency = list()
# summer_total_animals = sum(summer_animal_counts.values())
# winter_total_animals = sum(winter_animal_counts.values())
# autumn_total_animals = sum(autumn_animal_counts.values())
# spring_total_animals = sum(spring_animal_counts.values())
# summer_animal_labels = list()
# winter_animal_labels = list()
# autumn_animal_labels = list()
# spring_animal_labels = list()
# summer_total_others = 0
# winter_total_others = 0
# autumn_total_others = 0
# spring_total_others = 0

# for animal in summer_animal_counts:
#     if summer_animal_counts[animal]/summer_total_animals >= 0.025:
#         summer_animal_frequency.append(summer_animal_counts[animal])
#         summer_animal_labels.append(" ".join(word.capitalize() for word in animal.split()))
#     else:
#         summer_total_others += summer_animal_counts[animal]

# summer_animal_frequency.append(summer_total_others)
# summer_animal_labels.append("Others")

# for animal in winter_animal_counts:
#     if winter_animal_counts[animal]/winter_total_animals >= 0.025:
#         winter_animal_frequency.append(winter_animal_counts[animal])
#         winter_animal_labels.append(" ".join(word.capitalize() for word in animal.split()))
#     else:
#         summer_total_others += winter_animal_counts[animal]

# winter_animal_frequency.append(winter_total_others)
# winter_animal_labels.append("Others")

# for animal in autumn_animal_counts:
#     if autumn_animal_counts[animal]/autumn_total_animals >= 0.025:
#         autumn_animal_frequency.append(autumn_animal_counts[animal])
#         autumn_animal_labels.append(" ".join(word.capitalize() for word in animal.split()))
#     else:
#         autumn_total_animals += autumn_animal_counts[animal]

# autumn_animal_frequency.append(autumn_total_others)
# autumn_animal_labels.append("Others")

# for animal in spring_animal_counts:
#     if spring_animal_counts[animal]/spring_total_animals >= 0.025:
#         spring_animal_frequency.append(spring_animal_counts[animal])
#         spring_animal_labels.append(" ".join(word.capitalize() for word in animal.split()))
#     else:
#         spring_total_others += spring_animal_counts[animal]

# spring_animal_frequency.append(spring_total_others)
# spring_animal_labels.append("Others")

# pie charts

# plt.pie(summer_animal_frequency, labels = summer_animal_labels)
# plt.show()
# plt.pie(winter_animal_frequency, labels = winter_animal_labels)
# plt.show() 
# plt.pie(autumn_animal_frequency, labels = autumn_animal_labels)
# plt.show() 
# plt.pie(spring_animal_frequency, labels = spring_animal_labels)
# plt.show() 

#Yearly Trends

# year_dict = dict()
# months_dict = {"January": 0,
#                "February": 0,
#                "March": 0,
#                "April": 0,
#                "May": 0,
#                "June": 0,
#                "July": 0,
#                "August": 0,
#                "September": 0,
#                "October": 0,
#                "November": 0,
#                "December": 0}
# jurisdiction_counts = dict()
# species_counts = dict()

# for index, row in df.iterrows():
#     if row["DDateAdmittedYear"] in year_dict:
#         year_dict[int(row["DDateAdmittedYear"])] += 1
#     else:
#         year_dict[int(row["DDateAdmittedYear"])] = 1
    
#     months_dict[row["DDateAdmittedYear"]] += 1

#     if row["RescueJurisdiction"] in jurisdiction_counts:
#         jurisdiction_counts[row["RescueJurisdiction"]] += 1
#     else:
#         jurisdiction_counts[row["RescueJurisdiction"]] = 1

#     if row["CommonSpeciesName"] in species_counts:
#         species_counts[row["CommonSpeciesName"]] += 1
#     else:
#         species_counts[row["CommonSpeciesName"]] = 1

# species_counts_list = list()
# for species in species_counts:
#     species_counts_list.append((species_counts[species], species))

# species_counts_list = sorted(species_counts_list)
