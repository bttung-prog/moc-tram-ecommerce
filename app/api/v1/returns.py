from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.return_refund import ReturnRequest
from app.schemas.return_refund_dto import (
    ReturnCreateRequest, ReturnReviewRequest,
    RefundProcessRequest, ReturnRequestResponse,
    RefundRecordResponse
)
from app.services.return_refund_service import return_refund_service

router = APIRouter(prefix="/returns", tags=["Return & Refund (Đổi Trả & Hoàn Tiền)"])


@router.post("", response_model=ReturnRequestResponse, status_code=status.HTTP_201_CREATED, summary="Khách hàng tạo yêu cầu đổi trả hàng")
def create_return_request(req: ReturnCreateRequest, db: Session = Depends(get_db)):
    """
    Quy trình yêu cầu đổi trả cho khách:
    - Áp dụng khi sản phẩm gặp sự cố: vỡ nứt lư trầm khi vận chuyển, chuông xoay lệch âm, nhầm size vòng 108 hạt...
    - Kèm hình ảnh bằng chứng và lý do cụ thể.
    """
    return_req = return_refund_service.create_return_request(db, req)
    return ReturnRequestResponse.model_validate(return_req)


@router.get("/{request_code}", response_model=ReturnRequestResponse, summary="Tra cứu trạng thái yêu cầu đổi trả theo mã (e.g. RET261021882)")
def get_return_request(request_code: str, db: Session = Depends(get_db)):
    return_req = db.query(ReturnRequest).filter(ReturnRequest.request_code == request_code).first()
    if not return_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Không tìm thấy yêu cầu đổi trả '{request_code}'")
    return ReturnRequestResponse.model_validate(return_req)


@router.post("/{request_id}/review", response_model=ReturnRequestResponse, summary="Thẩm định yêu cầu đổi trả (Admin duyệt / từ chối)")
def review_return_request(request_id: int, review: ReturnReviewRequest, db: Session = Depends(get_db)):
    """Bộ phận CSKH kiểm tra bằng chứng và chấp thuận hoặc từ chối yêu cầu đổi trả."""
    return_req = return_refund_service.review_return_request(db, request_id, review)
    return ReturnRequestResponse.model_validate(return_req)


@router.post("/{request_id}/refund", response_model=RefundRecordResponse, summary="Xác nhận nhận hàng hoàn, Nhập kho (Restock) & Hoàn tiền")
async def process_return_refund(request_id: int, refund_req: RefundProcessRequest, db: Session = Depends(get_db)):
    """
    Khi hàng hoàn về đến kho Tĩnh Tâm Các:
    1. Kiểm tra tình trạng sản phẩm và tự động cộng lại tồn kho khả dụng (Restock).
    2. Kích hoạt lệnh hoàn tiền tự động qua PayPal API hoặc ủy nhiệm chi ngân hàng.
    3. Đơn hàng chuyển sang trạng thái REFUNDED.
    """
    refund_record = await return_refund_service.confirm_receipt_and_process_refund(db, request_id, refund_req)
    return RefundRecordResponse.model_validate(refund_record)
