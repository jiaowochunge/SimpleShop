package ai.bell.shop.config;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.alibaba.druid.spring.boot.autoconfigure.DruidDataSourceBuilder;
import com.smthit.framework.dal.bettlsql.SqlKitHolder;


@Configuration
@EnableTransactionManagement(proxyTargetClass = true)
public class DalConfig {

	@Bean
	@ConfigurationProperties("spring.datasource.druid")
	public DataSource dataSource(){
		return DruidDataSourceBuilder.create().build();
	}

	@Bean
	public SqlKitHolder sqlKitHolder() {
		return new SqlKitHolder();
	}

}