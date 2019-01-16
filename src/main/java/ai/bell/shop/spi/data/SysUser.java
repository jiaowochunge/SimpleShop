/**
 *
 */
package ai.bell.shop.spi.data;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.smthit.lang.json.jackson.LongJsonDeserializer;
import com.smthit.lang.json.jackson.LongJsonSerializer;

import lombok.Data;

/**
 * @author Bean
 *
 */
@Data
public class SysUser {
	@JsonSerialize(using = LongJsonSerializer.class)
	@JsonDeserialize(using = LongJsonDeserializer.class)
	private Long id;

	private String loginName;

	private String password;

}
