var data = {
    "zahid": {
        "_type": "Person",
        "id": "zahid",
        "name": "Zahid Hussain",
        "birth_year": "1957",
        "gender": "M",
        "place": "Mirpur",
        "parents": null,
        "marriages": ["zulekha+zahid"]
    },
    "zulekha": {
        "_type": "Person",
        "id": "zulekha",
        "name": "Zulekha Hussain",
        "birth_year": "1963",
        "gender": "F",
        "place": "Mirpur",
        "parents": null,
        "marriages": ["zulekha+zahid"]
    },
    "zulekha+zahid": {
        "_type": "Marriage",
        "partners": ["zahid", "zulekha"],
        "children": ["humera", "awais", "waqas"]
    },
    "humera": {
        "_type": "Person",
        "id": "humera",
        "name": "Humera Hussain",
        "birth_year": "1988",
        "gender": "F",
        "place": "London",
        "parents": "zulekha+zahid",
        "marriages": ["humera+shohaib"]
    },
    "shohaib": {
        "_type": "Person",
        "id": "shohaib",
        "name": "Shohaib Qureshi",
        "birth_year": "1985",
        "gender": "M",
        "place": "London",
        "parents": "shohaib_dad+shohaib_mum",
        "marriages": ["humera+shohaib"]
    },
    "humera+shohaib": {
        "_type": "Marriage",
        "partners": ["shohaib", "humera"],
        "children": ["yahya"]
    },
    "awais": {
        "_type": "Person",
        "id": "awais",
        "name": "Awais Hussain",
        "birth_year": "1991",
        "gender": "M",
        "place": "London",
        "parents": "zulekha+zahid",
        "marriages": []
    },
    "waqas": {
        "_type": "Person",
        "id": "waqas",
        "name": "Waqas Hussain",
        "birth_year": "1994",
        "gender": "M",
        "place": "London",
        "parents": "zulekha+zahid",
        "marriages": []
    },
    "yahya": {
        "_type": "Person",
        "id": "yahya",
        "name": "Yahya Qureshi",
        "birth_year": "2016",
        "gender": "M",
        "place": "London",
        "parents": "humera+shohaib",
        "marriages": []
    },
    "shohaib_mum": {
        "_type": "Person",
        "id": "shohaib_mum",
        "name": "Shohaib Mum",
        "birth_year": "1960",
        "gender": "F",
        "place": "Pakistan",
        "parents": null,
        "marriages": ["shohaib_dad+shohaib_mum"]
    },
    "shohaib_dad": {
        "_type": "Person",
        "id": "shohaib_dad",
        "name": "Shohaib Dad",
        "birth_year": "1952",
        "gender": "M",
        "place": "Pakistan",
        "parents": null,
        "marriages": ["shohaib_dad+shohaib_mum"]
    },
    "shohaib_dad+shohaib_mum": {
        "_type": "Marriage",
        "partners": ["shohaib_mum", "shohaib_dad"],
        "children": ["shohaib"]
    },
}
