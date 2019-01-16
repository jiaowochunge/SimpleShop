package ai.bell.shop.dal.entity;

import static com.smthit.framework.dal.bettlsql.SqlKit.mapper;

import org.beetl.sql.core.annotatoin.AssignID;
import org.beetl.sql.core.annotatoin.Table;
import org.beetl.sql.core.mapper.BaseMapper;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


/**
 * @author john
 *
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@lombok.experimental.Accessors(chain = true)
@Table(name = "products")
public class ProductPO extends BaseEntity {

	private static final long serialVersionUID = 3033667801280618699L;

	//用户ID
	@AssignID("simple")
	private Long id;

	private String name;

	private Long price;

	private String avatar;

	private String brief;

	public interface Dao extends BaseMapper <ProductPO> {
		Dao $ = mapper(Dao.class);
	}

}
