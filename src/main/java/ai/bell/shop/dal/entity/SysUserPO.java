package ai.bell.shop.dal.entity;

import static com.smthit.framework.dal.bettlsql.SqlKit.mapper;

import org.beetl.sql.core.annotatoin.AssignID;
import org.beetl.sql.core.annotatoin.Table;
import org.beetl.sql.core.mapper.BaseMapper;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


/**
 *
 *  gen by smthit 2018-04-19
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@lombok.experimental.Accessors(chain = true)
@Table(name = "sys_users")
public class SysUserPO extends BaseEntity {

	private static final long serialVersionUID = -7443468637915463823L;

	//用户ID
	@AssignID("simple")
	private Long id;

	//登录用户名
	private String loginName;

	//密码
	private String password;

	public interface Dao extends BaseMapper <SysUserPO> {
		Dao $ = mapper(Dao.class);
	}

}
