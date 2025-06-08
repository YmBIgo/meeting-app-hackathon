import requests
from bs4 import BeautifulSoup
from collections import defaultdict
import json

d_array = []

def scrape_month(month):
    fixed_month = month
    if len(month) == 1:
        fixed_month = "0" + month
    url = f"https://zatsuneta.com/category/anniversary{fixed_month}.html"
    res = requests.get(url)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, "html.parser")
    anni_list = soup.select("ul.anni_list li")

    data = defaultdict(list)
    index = 0
    for li in anni_list:
        index += 1
        a = li.findAll("a")
        if not a: continue
        for eachA in a:
            text = eachA.get_text(strip=True)
            # テキスト例："1月1日 元日"
            if len(text) >= 1:
                date = f"{month}/{index}"
                data[date].append(text)

    d_array.append(data)

for i in range(12):
    j = i + 1
    scrape_month(str(j))

result = json.dumps(d_array, ensure_ascii=False, indent=2)
with open("./year_anniversary.json", mode='w') as f:
    f.write(result)