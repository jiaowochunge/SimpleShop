package ai.bell.shop.spi.enums;

import com.smthit.lang.utils.EnumStatus;
import com.smthit.lang.utils.EnumStatusUtils;

public enum EnumCommonStatus implements EnumStatus {
	NORMAL(1, "正常"),
	DELETE(0, "已删除");

	private int value;
	private String desc;

	EnumCommonStatus(int value, String desc){
		this.value = value;
		this.desc = desc;
	}

	@Override
	public int getValue() {
		return value;
	}

	@Override
	public String getDesc() {
		return desc;
	}

	@Override
	public EnumStatus getEnumStatus(int value) {
		return EnumStatusUtils.getStatusByValue(EnumCommonStatus.class, value);
	}

}
