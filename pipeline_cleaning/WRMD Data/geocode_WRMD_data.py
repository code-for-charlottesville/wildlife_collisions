# %%
import pandas as pd
import geopandas as gpd
from dotenv import load_dotenv
import os
# import geopy as gpd
from geopy.geocoders import Nominatim, GoogleV3
from geopy.extra.rate_limiter import RateLimiter, AsyncRateLimiter
from functools import partial
from shapely.geometry import Point

load_dotenv(".env",override=True)

GMAPS_API_KEY = os.getenv("GMAPS_API_KEY")


#%%
# Load the data that needs geocoding
df = pd.read_pickle('./datasets/WRMD_2014_to_2025_geocoding_req.pkl')
# %%

# Get the first rows address
test_address = df['patients.address_found'].iloc[0]
test_city = df['patients.city_found'].iloc[0]
# %%
# geolocator = Nominatim(user_agent="WildVirginia")
# test_location = geolocator.geocode(f'{test_address}')
# %%

gmaps_geolocator = GoogleV3(api_key=GMAPS_API_KEY, user_agent="WildVirginia")

# test_location2 = gmaps_geolocator.geocode(f'{test_address}', components={'administrative_area': 'VA'})

#latidute and longitude 
# latitude = test_location2.latitude
# longitude = test_location2.longitude

# # %%
# # Validate that the returned geocoded location is WITHIN VA
# valitadion = is_in_virginia(latitude,longitude,virginia)

# %%
geocode1 = partial(gmaps_geolocator.geocode, components=[('administrative_area', 'VA'),('administrative_area', 'WV')])
geocodeUS = partial(gmaps_geolocator.geocode, components={'country': 'US'})
geocode = RateLimiter(geocodeUS, min_delay_seconds=1, error_wait_seconds=1)
# %%
# geocode = RateLimiter(gmaps_geolocator.geocode(components={'administrative_area': 'VA'}), min_delay_seconds=1)
sliced_df = df.iloc[0:5]
sliced_df["location"] = sliced_df['patients.address_found'].apply(geocode)

# %%
# Create a column in the dataframe that combines the address and city
df['address_city'] = df['patients.address_found'] + ', ' + df['patients.city_found']
# %%


def geocode_rows(df, start_index=0, chunk_size=5, num_chunks=1):
    """
    Geocode rows in the DataFrame in chunks.
    """
    # Create a copy of the DataFrame to avoid modifying the original
    # df_copy = df.copy()
    # Ensure that the dataframe has an empty column for the geocoded locations
    if 'location' not in df.columns:
        df['location'] = None
    # Loop through the DataFrame in chunks
    for i in range(num_chunks):
        # Calculate the start and end indices for the current chunk
        if start_index == 0:
            start_i = i * chunk_size
        else:
            # Adjust the start index for subsequent chunks
            start_i = start_index + (i * chunk_size)
        # Ensure the end index does not exceed the DataFrame length
        end_i = min(start_i + chunk_size, len(df))
        # Check if the end index is greater than the start index
        if end_i > start_i:
            # Print the current chunk being processed
            print(f"Processing chunk {i + 1} of {num_chunks}: Rows {start_i} to {end_i}")

        df.iloc[start_i:end_i, df.columns.get_loc('location')] = df.iloc[start_i:end_i, df.columns.get_loc('address_city')].apply(geocode)
        # Get the chunk of the DataFrame
        # df.loc[start_i:end_i, "location"] = df.loc[ start_i:end_i, 'patients.address_found'].apply(geocode)
        # Geocode the addresses in the chunk
        # chunk["location"] = chunk['patients.address_found'].apply(geocode)
        # # Write the location column the original DataFrame
        # df.iloc[start_i:end_i, "location"] = chunk["location"]

# %%

geocode_rows(df, start_index=124, chunk_size=1900, num_chunks=1)
# %%

#TODO: Checks if the geocoded location was successful,
# then checks if the location is not just a city / state

def location_types(loc_obj):
    """
    Get location type for the geocoded location object.
    """
    # Check if the location object is not None and has an address
    if loc_obj is not None:
        return loc_obj.raw['types']
    else:
        return None

# %%

df['loc_types'] = df['location'].apply(location_types)

# %%
def location_state(loc_obj):
    """
    Get location state for the geocoded location object.
    """
    # Check if the location object is not None and has an address
    if loc_obj is not None:
        for x in loc_obj.raw['address_components']:
            if 'administrative_area_level_1' in x['types']:
                return x['short_name']
    else:
        return None
    

# %%
df['loc_state'] = df['location'].apply(location_state)
df['loc_state'].value_counts()

# %%
def write_lat_to_df(loc_obj):
    # Check if the location object is not None and has an address
    if loc_obj is not None and 'street_address' in loc_obj.raw['types']:
        return loc_obj.raw['geometry']['location']['lat']
    else:
        return None

def write_lng_to_df(loc_obj):
    # Check if the location object is not None and has an address
    if loc_obj is not None and 'street_address' in loc_obj.raw['types']:
        return loc_obj.raw['geometry']['location']['lng']
    else:
        return None
    
# %%
df['patients.lat_found'] = df['location'].apply(write_lat_to_df)
df['patients.lng_found'] = df['location'].apply(write_lng_to_df)

# %%
# Reorder lat and lng columns to end of DF for easier viewing
cols_to_move =['patients.lat_found', 'patients.lng_found']
new_cols = [col for col in df.columns if col not in cols_to_move]
df = df[new_cols + cols_to_move]

# %%
def write_lat_long_to_df(lat, long, df, index):
    # Write the latitude and longitude to the DataFrame in place
    df.at[index, 'patients.lat_found'] = lat
    df.at[index, 'patients.lng_found'] = long
    return (lat, long)
# %%

# Output Results 
df.to_pickle('./datasets/WRMD_2014_to_2025_geocoded_v1.pkl')

# Load Results
df_geocoded = pd.read_pickle('./datasets/WRMD_2014_to_2025_geocoded_v1.pkl')