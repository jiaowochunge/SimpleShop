package ai.bell.shop.dal.entity;

import java.util.Date;

import org.beetl.sql.core.TailBean;

import com.smthit.framework.dal.bettlsql.ActiveRecord;
import com.smthit.framework.dal.data.Ignore;

import ai.bell.shop.spi.enums.EnumCommonStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * @author Bean
 *
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@lombok.experimental.Accessors(chain = true)
public class BaseEntity extends TailBean implements ActiveRecord {
	private static final long serialVersionUID = -3238799446345542294L;

	@Ignore
	private Date createdAt;

	@Ignore
	private Date updatedAt;

	@Ignore
	private Integer status;

	@Override
	public void updateStamp() {
		this.updatedAt = new Date();

		if(this.status == null){
			this.status = EnumCommonStatus.NORMAL.getValue();
		}
	}

	@Override
	public void createStamp() {
		this.updatedAt = new Date();
		//this.createdAt = new Date();
		// 如果子类重写改属性和方法，使用子类的实现
		this.setCreatedAt(new Date());
		if(this.status == null){
			this.status = EnumCommonStatus.NORMAL.getValue();
		}
	}
}
