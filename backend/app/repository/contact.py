from pymongo import ReturnDocument
from app.models.contact import CONTACT_COLLECTION, CONTACT_DOC_ID, ENQUIRY_COLLECTION


async def get_contact_content(db):
    return await db[CONTACT_COLLECTION].find_one({"_id": CONTACT_DOC_ID}, {"_id": 0})


async def save_contact_content(db, content: dict):
    await db[CONTACT_COLLECTION].replace_one({"_id": CONTACT_DOC_ID}, content, upsert=True)


async def insert_contact_content_if_missing(db, content: dict):
    await db[CONTACT_COLLECTION].update_one(
        {"_id": CONTACT_DOC_ID}, {"$setOnInsert": content}, upsert=True
    )


async def get_all_enquiries(db):
    return await db[ENQUIRY_COLLECTION].find({}, {"_id": 0}).sort("createdAt", -1).to_list(length=None)


async def create_enquiry(db, enquiry: dict):
    # insert_one adds _id to the dict it is given, so it gets a copy
    await db[ENQUIRY_COLLECTION].insert_one(dict(enquiry))


async def update_enquiry(db, enquiry_id: str, updates: dict):
    return await db[ENQUIRY_COLLECTION].find_one_and_update(
        {"id": enquiry_id}, {"$set": updates}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )


async def delete_enquiry(db, enquiry_id: str) -> bool:
    result = await db[ENQUIRY_COLLECTION].delete_one({"id": enquiry_id})
    return result.deleted_count > 0
