# import pytest
# import uuid
# from fastapi import HTTPException
# from app.crud.base import BaseCRUD
# from app.db.models.models import User
#
# # Initialize a test CRUD instance
# user_crud = BaseCRUD(User)
#
#
# @pytest.mark.asyncio
# async def test_get_by_attributes_invalid_type(db):
#     # Test that 422 is raised when passing 'abc' to a UUID field
#     with pytest.raises(HTTPException) as exc:
#         await user_crud.get_by_attributes(
#             db,
#             filters={"keycloak_id": "not-a-uuid"}
#         )
#     assert exc.value.status_code == 422
#
#
# @pytest.mark.asyncio
# async def test_create_and_get(db):
#     # Test basic creation through the generic layer
#     user_in = {
#         "username": "test_user",
#         "email": "test@nethub.co.ke",
#         "fullName": "Test User",
#         "keycloak_id": uuid.uuid4()
#     }
#     obj = await user_crud.create(db, obj_in=user_in)
#     assert obj.id is not None
#
#     found = await user_crud.get(db, id=obj.id)
#     assert found.email == "test@nethub.co.ke"