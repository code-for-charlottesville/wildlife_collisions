# %%
import pandas as pd
import geopandas as gpd
from dotenv import load_dotenv
import os
# import geopy as gpd
from geopy.geocoders import Nominatim, GoogleV3
from geopy.extra.rate_limiter import RateLimiter, AsyncRateLimiter

from shapely.geometry import Point

load_dotenv(".env",override=True)

GMAPS_API_KEY = os.getenv("GMAPS_API_KEY")

# # %%
# # Download Virginia state boundary
# # TIGER/Line 2023 state boundaries
# url = "https://www2.census.gov/geo/tiger/TIGER2023/STATE/tl_2023_us_state.zip"
# # %%

# # Load into GeoDataFrame
# states = gpd.read_file(url)
# # %%

# # Filter for Virginia
# virginia = states[states.NAME == 'Virginia']
# # %%

# # Save to local file if you want to reuse
# virginia.to_file("virginia_boundary.shp")  # or .geojson, .gpkg

# # %%
# #virginia checker function 
# def is_in_virginia(lat, lon, virginia_gdf):
#     point = Point(lon, lat)
#     return virginia_gdf.geometry.contains(point).any()

#%%
# Load the data that needs geocoding
df = pd.read_pickle('./datasets/WRMD_2014_to_2025_geocoding_req.pkl')
# %%

# Get the first rows address
test_address = df['patients.address_found'].iloc[0]
test_city = df['patients.city_found'].iloc[0]
# %%

geolocator = Nominatim(user_agent="WildVirginia")
test_location = geolocator.geocode(f'{test_address}')
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
geocode = RateLimiter(gmaps_geolocator.geocode, min_delay_seconds=1, error_wait_seconds=5)
# geocode = RateLimiter(gmaps_geolocator.geocode(components={'administrative_area': 'VA'}), min_delay_seconds=1)
sliced_df = df.iloc[0:5]
sliced_df["location"] = sliced_df['patients.address_found'].apply(geocode)
# %%

def geocode_rows(df, start_index=0, chunk_size=100, num_chunks=1):
    """
    Geocode rows in the DataFrame in chunks.
    """
    # Create a copy of the DataFrame to avoid modifying the original
    df_copy = df.copy()

    # Loop through the DataFrame in chunks
    for start in range(start_index, len(df_copy), chunk_size):
        for i in range(num_chunks):
            end = min(start + chunk_size, len(df_copy))
            chunk = df_copy.iloc[start:end]

            # Geocode the addresses in the chunk
            chunk["location"] = chunk['patients.address_found'].apply(geocode)
            # Copy the geocoded location object back to the original DataFrame in a new column
            df_copy.loc[start:end, 'location'] = chunk['location']

    return df_copy

# %%

df_first_pass = geocode_rows(df, start_index=0, chunk_size=100, num_chunks=1)
# %%

#TODO: Checks if the geocoded location was successful,
# then checnks if the location is not just a city / state

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






def write_lat_long_to_df(lat, long, df, index):
    # Write the latitude and longitude to the DataFrame in place
    df.at[index, 'patients.lat_found'] = lat
    df.at[index, 'patients.lng_found'] = long
    return (lat, long)